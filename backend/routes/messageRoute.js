import express from 'express';
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount,
  markAsRead,
  deleteMessage
} from '../controller/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all conversations
router.get('/conversations', getConversations);

// Get conversation messages
router.get('/conversations/:otherUserId', getConversationMessages);
router.get('/conversations/:otherUserId/:propertyId', getConversationMessages);

// Send message
router.post('/send', sendMessage);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Mark message as read
router.patch('/:messageId/read', markAsRead);

// Delete message
router.delete('/:messageId', deleteMessage);

export default router;