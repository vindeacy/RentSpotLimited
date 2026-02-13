import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get tenant dashboard
export const getTenantDashboard = async (req, res) => {
  try {
    const { userId } = req.user;

    const tenant = await prisma.tenant.findUnique({
      where: { userId }
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const now = new Date();

    // Active rentals
    const activeRentals = await prisma.lease.count({
      where: {
        tenantId: tenant.id,
        status: 'active',
        endDate: {
          gte: now
        }
      }
    });

    // Current lease
    const currentLease = await prisma.lease.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'active',
        endDate: {
          gte: now
        }
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            addressLine: true,
            city: true,
            images: {
              take: 1,
              orderBy: { position: 'asc' }
            }
          }
        },
        landlord: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        }
      }
    });

    // Monthly rent (next payment due)
    const nextPayment = await prisma.payment.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'pending',
        dueDate: {
          gte: now
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Pending issues (maintenance requests)
    const pendingIssues = await prisma.maintenanceRequest.count({
      where: {
        tenantId: tenant.id,
        status: {
          in: ['open', 'in_progress']
        }
      }
    });

    // Unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        toUserId: userId,
        readAt: null
      }
    });

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id
      },
      include: {
        lease: {
          include: {
            property: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Upcoming payments
    const upcomingPayments = await prisma.payment.findMany({
      where: {
        tenantId: tenant.id,
        status: 'pending',
        dueDate: {
          gte: now
        }
      },
      orderBy: { dueDate: 'asc' },
      take: 3
    });

    res.json({
      success: true,
      data: {
        overview: {
          activeRentals,
          monthlyRent: nextPayment?.amount || 0,
          nextPaymentDue: nextPayment?.dueDate || null,
          pendingIssues,
          unreadMessages
        },
        currentProperty: currentLease ? {
          id: currentLease.property.id,
          title: currentLease.property.title,
          location: `${currentLease.property.addressLine}, ${currentLease.property.city}`,
          landlord: currentLease.landlord.user.name,
          monthlyRent: currentLease.rent,
          leaseStart: currentLease.startDate,
          leaseEnd: currentLease.endDate,
          image: currentLease.property.images[0]?.imageUrl || null
        } : null,
        recentPayments,
        upcomingPayments
      }
    });

  } catch (error) {
    console.error('Get tenant dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant dashboard',
      error: error.message
    });
  }
};

// Get landlord dashboard
export const getLandlordDashboard = async (req, res) => {
  try {
    const { userId } = req.user;

    const landlord = await prisma.landlord.findUnique({
      where: { userId }
    });

    if (!landlord) {
      return res.status(404).json({
        success: false,
        message: 'Landlord not found'
      });
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total properties
    const totalProperties = await prisma.property.count({
      where: { landlordId: landlord.id }
    });

    // Properties this month vs last month
    const propertiesThisMonth = await prisma.property.count({
      where: {
        landlordId: landlord.id,
        createdAt: {
          gte: thisMonth
        }
      }
    });

    const propertiesLastMonth = await prisma.property.count({
      where: {
        landlordId: landlord.id,
        createdAt: {
          gte: lastMonth,
          lt: thisMonth
        }
      }
    });

    // Active tenants
    const activeTenants = await prisma.lease.count({
      where: {
        landlordId: landlord.id,
        status: 'active',
        endDate: {
          gte: now
        }
      }
    });

    // Tenants this month vs last month
    const tenantsThisMonth = await prisma.lease.count({
      where: {
        landlordId: landlord.id,
        status: 'active',
        createdAt: {
          gte: thisMonth
        }
      }
    });

    const tenantsLastMonth = await prisma.lease.count({
      where: {
        landlordId: landlord.id,
        status: 'active',
        createdAt: {
          gte: lastMonth,
          lt: thisMonth
        }
      }
    });

    // Monthly revenue
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        lease: { landlordId: landlord.id },
        status: 'paid',
        paidDate: {
          gte: thisMonth,
          lte: now
        }
      },
      _sum: {
        netAmount: true
      }
    });

    // Last month revenue
    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        lease: { landlordId: landlord.id },
        status: 'paid',
        paidDate: {
          gte: lastMonth,
          lt: thisMonth
        }
      },
      _sum: {
        netAmount: true
      }
    });

    const currentRevenue = monthlyRevenue._sum.netAmount || 0;
    const previousRevenue = lastMonthRevenue._sum.netAmount || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Occupancy rate
    const occupiedProperties = await prisma.property.count({
      where: {
        landlordId: landlord.id,
        status: 'occupied'
      }
    });

    const occupancyRate = totalProperties > 0 
      ? (occupiedProperties / totalProperties) * 100 
      : 0;

    // Pending maintenance
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        landlordId: landlord.id,
        status: {
          in: ['open', 'in_progress']
        }
      }
    });

    // Last week maintenance
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastWeekMaintenance = await prisma.maintenanceRequest.count({
      where: {
        landlordId: landlord.id,
        status: {
          in: ['open', 'in_progress']
        },
        createdAt: {
          gte: lastWeek
        }
      }
    });

    const maintenanceChange = lastWeekMaintenance - pendingMaintenance;

    // Unread messages
    const unreadMessages = await prisma.message.count({
      where: {
        toUserId: userId,
        readAt: null
      }
    });

    // Last message time
    const lastMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: {
        landlordId: landlord.id
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        lease: { landlordId: landlord.id },
        status: 'paid'
      },
      include: {
        tenant: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        lease: {
          include: {
            property: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { paidDate: 'desc' },
      take: 5
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProperties,
          propertiesChange: propertiesThisMonth - propertiesLastMonth,
          activeTenants,
          tenantsChange: tenantsThisMonth - tenantsLastMonth,
          monthlyRevenue: currentRevenue,
          revenueChange: parseFloat(revenueChange.toFixed(2)),
          occupancyRate: parseFloat(occupancyRate.toFixed(2)),
          pendingMaintenance,
          maintenanceChange,
          unreadMessages,
          lastMessageTime: lastMessage?.createdAt || null
        },
        recentActivity,
        recentPayments
      }
    });

  } catch (error) {
    console.error('Get landlord dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landlord dashboard',
      error: error.message
    });
  }
};

// Get quick stats
export const getQuickStats = async (req, res) => {
  try {
    const { landlordId, tenantId } = req.query;

    if (landlordId) {
      const stats = {
        totalProperties: await prisma.property.count({ where: { landlordId } }),
        activeLeases: await prisma.lease.count({ 
          where: { 
            landlordId, 
            status: 'active',
            endDate: { gte: new Date() }
          } 
        }),
        pendingApplications: await prisma.application.count({
          where: {
            property: { landlordId },
            status: 'pending'
          }
        }),
        totalRevenue: (await prisma.payment.aggregate({
          where: {
            lease: { landlordId },
            status: 'paid'
          },
          _sum: { netAmount: true }
        }))._sum.netAmount || 0
      };

      return res.json({ success: true, stats });
    }

    if (tenantId) {
      const stats = {
        activeLeases: await prisma.lease.count({ 
          where: { 
            tenantId, 
            status: 'active',
            endDate: { gte: new Date() }
          } 
        }),
        totalPayments: await prisma.payment.count({
          where: { tenantId, status: 'paid' }
        }),
        pendingPayments: await prisma.payment.count({
          where: { tenantId, status: 'pending' }
        }),
        maintenanceRequests: await prisma.maintenanceRequest.count({
          where: { tenantId }
        })
      };

      return res.json({ success: true, stats });
    }

    res.status(400).json({
      success: false,
      message: 'Landlord ID or Tenant ID required'
    });

  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick stats',
      error: error.message
    });
  }
};