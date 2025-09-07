import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import {
	getAllMessages,
	getMessageById,
	createMessage,
	updateMessage,
	deleteMessage
} from '../controller/messageController.js';

const router = express.Router();

// Protect all message routes
router.use(authenticationMiddleware);

// Get all messages
router.get('/', getAllMessages);

// Get single message by ID
router.get('/:id', getMessageById);

// Create message
router.post('/', createMessage);

// Update message
router.put('/:id', updateMessage);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
