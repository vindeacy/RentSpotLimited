import jwt from 'jsonwebtoken';
import prisma from '../lib/db.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';

// Token blacklist (use Redis in production)
const tokenBlacklist = new Set();

export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '15m' } 
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } 
  );
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token cookie (short-lived, httpOnly, secure)
  res.cookie('accessToken', accessToken, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict', 
    maxAge: 15 * 60 * 1000,
    path: '/'
  });

  // Refresh token cookie (long-lived, httpOnly, secure)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });
};

/**
 * Main authentication middleware
 * Reads token from cookies instead of headers
 */
export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from cookie first, fallback to header (for backward compatibility)
    let token = req.cookies?.accessToken;
    
    // Fallback to Authorization header if cookie not present
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'No token provided. Please login.' 
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      clearAuthCookies(res);
      return res.status(401).json({ 
        success: false,
        error: 'Token invalidated',
        message: 'This token has been revoked. Please login again.' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Try to refresh the token
        return handleTokenRefresh(req, res, next);
      }
      
      if (err.name === 'JsonWebTokenError') {
        clearAuthCookies(res);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token',
          message: 'Authentication token is invalid.' 
        });
      }

      throw err;
    }

    // Validate user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        landlord: {
          select: {
            id: true,
            companyName: true,
            kraPin: true,
            rating: true
          }
        },
        tenant: {
          select: {
            id: true,
            employmentStatus: true,
            rating: true
          }
        }
      }
    });

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        message: 'User account no longer exists.' 
      });
    }

    if (!user.isActive) {
      clearAuthCookies(res);
      return res.status(403).json({ 
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please contact support.' 
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      landlordId: user.landlord?.id || null,
      tenantId: user.tenant?.id || null,
      landlord: user.landlord || null,
      tenant: user.tenant || null
    };

    req.token = token; // Store token for potential blacklisting

    next();

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Authentication failed',
      message: 'An error occurred during authentication.' 
    });
  }
};

/**
 * Handle token refresh when access token expires
 */
const handleTokenRefresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'Refresh token invalid',
        message: 'Please login again.'
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        landlord: { select: { id: true, companyName: true, kraPin: true, rating: true } },
        tenant: { select: { id: true, employmentStatus: true, rating: true } }
      }
    });

    if (!user || !user.isActive) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'Please login again.'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      landlordId: user.landlord?.id || null,
      tenantId: user.tenant?.id || null,
      landlord: user.landlord || null,
      tenant: user.tenant || null
    };

    req.token = newAccessToken;

    next();

  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      message: 'Please login again.'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const isLandlord = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'landlord') {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden',
      message: 'This action requires landlord privileges.' 
    });
  }

  if (!req.user.landlordId) {
    return res.status(403).json({ 
      success: false,
      error: 'Landlord profile not found',
      message: 'Landlord profile is required to perform this action.' 
    });
  }

  next();
};

export const isTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'tenant') {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden',
      message: 'This action requires tenant privileges.' 
    });
  }

  if (!req.user.tenantId) {
    return res.status(403).json({ 
      success: false,
      error: 'Tenant profile not found',
      message: 'Tenant profile is required to perform this action.' 
    });
  }

  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden',
      message: 'This action requires administrator privileges.' 
    });
  }

  next();
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication required.' 
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Email not verified',
      message: 'Please verify your email address to continue.' 
    });
  }

  next();
};

export const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        landlord: { select: { id: true } },
        tenant: { select: { id: true } }
      }
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        landlordId: user.landlord?.id || null,
        tenantId: user.tenant?.id || null
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

/**
 * Blacklist token (for logout)
 */
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Auto-remove from blacklist after token expiration
  const tokenExpiry = 15 * 60 * 1000; // 15 minutes
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, tokenExpiry);
};

export const logAuthRequest = (req, res, next) => {
  if (req.user) {
    console.log(`[AUTH] ${req.method} ${req.path} - User: ${req.user.email} (${req.user.role})`);
  }
  next();
};

const requestCounts = new Map();

export const rateLimitSensitive = (maxRequests = 5, windowMs = 60000) => {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const key = `${req.user.userId}:${req.path}`;
    const now = Date.now();
    const userRequests = requestCounts.get(key) || [];

    const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Please wait before trying again. Limit: ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    recentRequests.push(now);
    requestCounts.set(key, recentRequests);

    next();
  };
};

// Backward compatibility
export const authenticationMiddleware = authenticate;

export default {
  authenticate,
  isLandlord,
  isTenant,
  isAdmin,
  checkRole,
  requireVerified,
  optionalAuth,
  blacklistToken,
  logAuthRequest,
  rateLimitSensitive,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies
};