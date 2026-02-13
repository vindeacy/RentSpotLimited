
import bcrypt from 'bcrypt';
import db from '../lib/db.js';
import dotenv from 'dotenv';
import {
	generateAccessToken,
	generateRefreshToken,
	setAuthCookies
} from '../middleware/auth.js';

dotenv.config();

// Register a new user
export async function register(req, res) {
	const { email, password, name, role, phone } = req.body;
	if (!email || !password || !role) {
		return res.status(400).json({ error: 'Email, password, and role are required.' });
	}
	try {
		const existingUser = await db.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(409).json({ error: 'User already exists.' });
		}
		const passwordHash = await bcrypt.hash(password, 10);
		
		// Create user with appropriate profile
		const user = await db.user.create({
			data: { 
				email, 
				passwordHash, 
				name, 
				phone,
				role,
				// Create tenant or landlord profile based on role
				...(role === 'tenant' ? {
					tenant: {
						create: {}
					}
				} : role === 'landlord' ? {
					landlord: {
						create: {}
					}
				} : {})
			}
		});
		
		return res.status(201).json({ message: 'User registered successfully.', user: { id: user.id, email: user.email, role: user.role } });
	} catch (err) {
		console.error('Registration error:', err);
		return res.status(500).json({ error: 'Registration failed.' });
	}
}
// Login user
export async function login(req, res) {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ error: 'Email and password are required.' });
	}
	try {
		const user = await db.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}
		const valid = await bcrypt.compare(password, user.passwordHash);
		if (!valid) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}
		const accessToken = generateAccessToken(user.id, user.role);
		const refreshToken = generateRefreshToken(user.id);
		setAuthCookies(res, accessToken, refreshToken);
		return res.json({ token: accessToken, user: { id: user.id, email: user.email, role: user.role } });
	} catch (err) {
		return res.status(500).json({ error: 'Login failed.' });
	}
}
// Get user profile
export async function getUserProfile(req, res) {
	try {
		const userId = req.user.userId;
		const user = await db.user.findUnique({
			where: { id: userId },
			select: { 
				id: true, 
				email: true, 
				name: true, 
				role: true, 
				phone: true, 
				isActive: true, 
				isVerified: true,
				createdAt: true, 
				updatedAt: true,
				tenant: {
					select: {
						id: true,
						employmentStatus: true,
						rating: true,
						moveInDate: true,
						currentPropertyId: true,
						emergencyContactName: true,
						emergencyContactPhone: true,
						emergencyContactEmail: true,
						emergencyContactRelation: true
					}
				},
				landlord: {
					select: {
						id: true,
						companyName: true,
						kraPin: true,
						rating: true
					}
				}
			}
		});
		if (!user) {
			return res.status(404).json({ error: 'User not found.' });
		}
		return res.json({ user });
	} catch (err) {
		console.error('Profile fetch error:', err);
		return res.status(500).json({ error: 'Failed to fetch user profile.', details: err.message });
	}
}

// Get all users
export async function getAllUsers(req, res) {
	try {
		const users = await db.user.findMany({
			select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true, updatedAt: true }
		});
		return res.json({ users });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch users.' });
	}
}


// Update user profile
export async function updateUserProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { name, phone } = req.body;
			// Only allow updating safe fields
			const allowedFields = ['email', 'name', 'phone', 'role', 'isActive'];
			const updateData = {};
			for (const field of allowedFields) {
				if (req.body[field] !== undefined) {
					updateData[field] = req.body[field];
				}
			}
			if (Object.keys(updateData).length === 0) {
				return res.status(400).json({ error: 'No valid fields to update.' });
			}
        const user = await db.user.update({
            where: { id: userId },
            data: updateData
        });
        return res.json({ message: 'Profile updated successfully.', user });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
}

// Delete user
export async function deleteUser(req, res) {
	try {
		const userId = req.params.id;
		await db.user.delete({ where: { id: userId } });
		return res.json({ message: 'User deleted successfully.' });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to delete user.' });
	}
}
