import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationsByType
} from '../controller/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Get notifications by type
router.get('/type/:type', getNotificationsByType);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

export default router;