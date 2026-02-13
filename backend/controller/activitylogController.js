import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Create activity log (internal use)
export const createActivityLog = async (data) => {
  try {
    const activityLog = await prisma.activityLog.create({
      data: {
        userId: data.userId || null,
        landlordId: data.landlordId || null,
        tenantId: data.tenantId || null,
        action: data.action,
        description: data.description,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata || null,
        severity: data.severity || 'info'
      }
    });

    return activityLog;
  } catch (error) {
    console.error('Create activity log error:', error);
    throw error;
  }
};

// Get landlord activity logs
export const getLandlordActivityLogs = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { action, entityType, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const where = { landlordId };

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        landlord: {
          include: { user: { select: { name: true } } }
        },
        tenant: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.activityLog.count({ where });

    res.json({
      success: true,
      count: activityLogs.length,
      totalCount,
      activityLogs
    });

  } catch (error) {
    console.error('Get landlord activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// Get tenant activity logs
export const getTenantActivityLogs = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { action, limit = 50, offset = 0 } = req.query;

    const where = { tenantId };

    if (action) {
      where.action = action;
    }

    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        tenant: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.activityLog.count({ where });

    res.json({
      success: true,
      count: activityLogs.length,
      totalCount,
      activityLogs
    });

  } catch (error) {
    console.error('Get tenant activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
  try {
    const { landlordId, tenantId } = req.query;
    const { limit = 10 } = req.query;

    const where = {};

    if (landlordId) {
      where.landlordId = landlordId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: {
        landlord: {
          include: { user: { select: { name: true } } }
        },
        tenant: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      count: activityLogs.length,
      activityLogs
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

// Get activity by entity
export const getActivityByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        entityType,
        entityId
      },
      include: {
        landlord: {
          include: { user: { select: { name: true } } }
        },
        tenant: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: activityLogs.length,
      activityLogs
    });

  } catch (error) {
    console.error('Get activity by entity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
};

// Delete old activity logs (cleanup)
export const deleteOldActivityLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        severity: 'info' // Only delete info logs, keep warnings and errors
      }
    });

    res.json({
      success: true,
      message: `${result.count} activity logs deleted`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Delete old activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity logs',
      error: error.message
    });
  }
};