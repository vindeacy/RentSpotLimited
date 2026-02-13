import db from '../lib/db.js';

// Get all conversations for a user (grouped by property/participants)
const getConversations = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all messages where user is sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            landlord: true,
            tenant: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            landlord: true,
            tenant: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { position: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group messages by conversation (property + other participant)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      const conversationKey = `${msg.propertyId || 'general'}_${otherUserId}`;

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          conversationId: conversationKey,
          propertyId: msg.propertyId,
          property: msg.property,
          participant: msg.fromUserId === userId ? msg.toUser : msg.fromUser,
          lastMessage: msg.body,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }

      const conversation = conversationsMap.get(conversationKey);
      conversation.messages.push(msg);
      
      // Count unread messages (messages to current user without read status)
      if (msg.toUserId === userId && !msg.readAt) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      totalConversations: conversations.length,
      totalUnread: conversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
      conversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch conversations',
      error: error.message 
    });
  }
};

// Get messages in a specific conversation
const getConversationMessages = async (req, res) => {
  try {
    const { userId } = req.user;
    const { otherUserId, propertyId } = req.params;

    const messages = await db.message.findMany({
      where: {
        AND: [
          { propertyId: propertyId || null },
          {
            OR: [
              { fromUserId: userId, toUserId: otherUserId },
              { fromUserId: otherUserId, toUserId: userId }
            ]
          }
        ]
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            addressLine: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await db.message.updateMany({
      where: {
        toUserId: userId,
        fromUserId: otherUserId,
        propertyId: propertyId || null,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      count: messages.length,
      messages
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages',
      error: error.message 
    });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.user;
    const { toUserId, propertyId, subject, body } = req.body;

    if (!toUserId || !body) {
      return res.status(400).json({
        success: false,
        message: 'Recipient and message body are required'
      });
    }

    const message = await db.message.create({
      data: {
        fromUserId: userId,
        toUserId,
        propertyId: propertyId || null,
        subject,
        body,
        createdAt: new Date()
      },
      include: {
        fromUser: {
          select: { id: true, name: true, email: true, role: true }
        },
        toUser: {
          select: { id: true, name: true, email: true, role: true }
        },
        property: {
          select: { id: true, title: true }
        }
      }
    });

    // Create notification for recipient
    await db.notification.create({
      data: {
        userId: toUserId,
        tenantId: message.toUser.tenant?.id,
        landlordId: message.toUser.landlord?.id,
        type: 'new_message',
        title: 'New Message',
        message: `${message.fromUser.name} sent you a message`,
        link: `/messages/${userId}${propertyId ? `?property=${propertyId}` : ''}`,
        metadata: {
          messageId: message.id,
          fromUserId: userId,
          propertyId
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message',
      error: error.message 
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.user;

    const unreadCount = await db.message.count({
      where: {
        toUserId: userId,
        readAt: null
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

// Mark message as read
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user;

    const message = await db.message.update({
      where: {
        id: messageId,
        toUserId: userId
      },
      data: {
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark message as read',
      error: error.message 
    });
  }
};

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user;

    // Verify user owns the message
    const message = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!message || (message.fromUserId !== userId && message.toUserId !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message'
      });
    }

    await db.message.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message',
      error: error.message 
    });
  }
};

export {
  getConversations,
  getConversationMessages,
  sendMessage,
  getUnreadCount,
  markAsRead,
  deleteMessage
};