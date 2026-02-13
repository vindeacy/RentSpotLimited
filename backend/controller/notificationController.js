import db from '../lib/db.js';

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { unreadOnly, limit = 50, offset = 0 } = req.query;

    const where = { userId };
    
    if (unreadOnly === 'true') {
      where.read = false;
    }
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const unreadCount = await db.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.user;

    const unreadCount = await db.notification.count({
      where: {
        userId,
        read: false
      }
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    const notification = await db.notification.update({
      where: {
        id: notificationId,
        userId
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const result = await db.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true
      }
    });

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`,
      count: result.count
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    await db.notification.delete({
      where: {
        id: notificationId,
        userId
      }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create notification (internal use)
export const createNotification = async (data) => {
  try {
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        tenantId: data.tenantId || null,
        landlordId: data.landlordId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
        priority: data.priority || 'normal',
        metadata: data.metadata || null
      }
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Get notifications by type
export const getNotificationsByType = async (req, res) => {
  try {
    const { userId } = req.user;
    const { type } = req.params;

    const notifications = await db.notification.findMany({
      where: {
        userId,
        type
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error('Get notifications by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

