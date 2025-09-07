// Get user profile
export async function getUserProfile(req, res) {
	try {
		const userId = req.user.userId;
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, name: true, role: true, phone: true, isActive: true, createdAt: true, updatedAt: true }
		});
		if (!user) {
			return res.status(404).json({ error: 'User not found.' });
		}
		return res.json({ user });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch user profile.' });
	}
}

// Update user profile
export async function updateUserProfile(req, res) {
	try {
		const userId = req.user.userId;
		const { name, phone } = req.body;
		const user = await prisma.user.update({
			where: { id: userId },
			data: { name, phone }
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
		await prisma.user.delete({ where: { id: userId } });
		return res.json({ message: 'User deleted successfully.' });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to delete user.' });
	}
}
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
// Register a new user
export async function register(req, res) {
	const { email, password, name, role } = req.body;
	if (!email || !password || !role) {
		return res.status(400).json({ error: 'Email, password, and role are required.' });
	}
	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return res.status(409).json({ error: 'User already exists.' });
		}
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, passwordHash, name, role }
		});
		return res.status(201).json({ message: 'User registered successfully.', user: { id: user.id, email: user.email, role: user.role } });
	} catch (err) {
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
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: 'Invalid credentials.' });
	}
	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) {
			return res.status(401).json({ error: 'Invalid credentials.' });
		}
		const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
		return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
	} catch (err) {
		return res.status(500).json({ error: 'Login failed.' });
	}
}
