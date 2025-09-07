import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all messages
export async function getAllMessages(req, res) {
	try {
		const messages = await prisma.message.findMany({
			include: { fromUser: true, toUser: true, property: true }
		});
		res.json({ messages });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch messages.' });
	}
}

// Get single message by ID
export async function getMessageById(req, res) {
	try {
		const { id } = req.params;
		const message = await prisma.message.findUnique({
			where: { id },
			include: { fromUser: true, toUser: true, property: true }
		});
		if (!message) return res.status(404).json({ error: 'Message not found.' });
		res.json({ message });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch message.' });
	}
}

// Create message
export async function createMessage(req, res) {
	try {
		const { fromUserId, toUserId, propertyId, subject, body } = req.body;
		const message = await prisma.message.create({
			data: { fromUserId, toUserId, propertyId, subject, body }
		});
		res.status(201).json({ message });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create message.' });
	}
}

// Update message
export async function updateMessage(req, res) {
	try {
		const { id } = req.params;
		const { subject, body, read } = req.body;
		const message = await prisma.message.update({
			where: { id },
			data: { subject, body, read }
		});
		res.json({ message });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update message.' });
	}
}

// Delete message
export async function deleteMessage(req, res) {
	try {
		const { id } = req.params;
		await prisma.message.delete({ where: { id } });
		res.json({ message: 'Message deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete message.' });
	}
}
