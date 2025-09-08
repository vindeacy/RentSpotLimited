import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dd9689353d1957967ec6879add265383';

export function generateToken(payload, expiresIn = '1d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
