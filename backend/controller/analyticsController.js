import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get landlord analytics overview
export const getLandlordAnalytics = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { startDate, endDate, period = 'month' } = req.query;

    // Date range setup
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    // Total properties
    const totalProperties = await prisma.property.count({
      where: { landlordId }
    });

    // Active properties (with active leases)
    const activeProperties = await prisma.property.count({
      where: {
        landlordId,
        status: 'occupied'
      }
    });

    // Vacant properties
    const vacantProperties = totalProperties - activeProperties;

    // Active tenants
    const activeTenants = await prisma.lease.count({
      where: {
        landlordId,
        status: 'active',
        endDate: {
          gte: now
        }
      }
    });

    // Monthly revenue (paid this month)
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        lease: { landlordId },
        status: 'paid',
        paidDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: now
        }
      },
      _sum: {
        netAmount: true
      }
    });

    // Yearly revenue
    const yearlyRevenue = await prisma.payment.aggregate({
      where: {
        lease: { landlordId },
        status: 'paid',
        paidDate: {
          gte: new Date(now.getFullYear(), 0, 1),
          lte: now
        }
      },
      _sum: {
        netAmount: true
      }
    });

    // Occupancy rate
    const occupancyRate = totalProperties > 0 
      ? (activeProperties / totalProperties) * 100 
      : 0;

    // Pending maintenance requests
    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        landlordId,
        status: {
          in: ['open', 'in_progress']
        }
      }
    });

    // Overdue payments
    const overduePayments = await prisma.payment.count({
      where: {
        lease: { landlordId },
        status: 'overdue'
      }
    });

    // Total inquiries (applications)
    const totalInquiries = await prisma.application.count({
      where: {
        property: { landlordId }
      }
    });

    // Revenue trend (last 12 months)
    const revenueTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthRevenue = await prisma.payment.aggregate({
        where: {
          lease: { landlordId },
          status: 'paid',
          paidDate: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          netAmount: true
        }
      });

      revenueTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue._sum.netAmount || 0
      });
    }

    // Property performance
    const propertyPerformance = await prisma.property.findMany({
      where: { landlordId },
      include: {
        leases: {
          where: {
            status: 'active'
          },
          include: {
            payments: {
              where: {
                status: 'paid',
                paidDate: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        },
        maintenanceRequests: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    const propertyStats = propertyPerformance.map(property => ({
      propertyId: property.id,
      title: property.title,
      status: property.status,
      revenue: property.leases.reduce((sum, lease) => 
        sum + lease.payments.reduce((pSum, payment) => pSum + (payment.netAmount || 0), 0), 0
      ),
      maintenanceCount: property.maintenanceRequests.length,
      occupancyDays: property.leases.length > 0 ? 
        Math.floor((now - property.leases[0].startDate) / (1000 * 60 * 60 * 24)) : 0
    }));

    // Expense summary
    const expenses = await prisma.expense.aggregate({
      where: {
        landlordId,
        date: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalExpenses = expenses._sum.amount || 0;
    const netProfit = (monthlyRevenue._sum.netAmount || 0) - totalExpenses;

    // Tax summary
    const taxWithheld = await prisma.payment.aggregate({
      where: {
        lease: { landlordId },
        status: 'paid',
        paidDate: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        withholdingTax: true
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProperties,
          activeProperties,
          vacantProperties,
          activeTenants,
          monthlyRevenue: monthlyRevenue._sum.netAmount || 0,
          yearlyRevenue: yearlyRevenue._sum.netAmount || 0,
          occupancyRate: parseFloat(occupancyRate.toFixed(2)),
          pendingMaintenance,
          overduePayments,
          totalInquiries,
          totalExpenses,
          netProfit,
          taxWithheld: taxWithheld._sum.withholdingTax || 0
        },
        revenueTrend,
        propertyPerformance: propertyStats,
        period: {
          start,
          end
        }
      }
    });

  } catch (error) {
    console.error('Get landlord analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get tenant analytics
export const getTenantAnalytics = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const now = new Date();

    // Current lease
    const currentLease = await prisma.lease.findFirst({
      where: {
        tenantId,
        status: 'active',
        endDate: {
          gte: now
        }
      },
      include: {
        property: true
      }
    });

    // Payment summary
    const totalPaid = await prisma.payment.aggregate({
      where: {
        tenantId,
        status: 'paid'
      },
      _sum: {
        amount: true
      }
    });

    const pendingPayments = await prisma.payment.count({
      where: {
        tenantId,
        status: 'pending'
      }
    });

    const overduePayments = await prisma.payment.count({
      where: {
        tenantId,
        status: 'overdue'
      }
    });

    // Maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.count({
      where: { tenantId }
    });

    const pendingMaintenance = await prisma.maintenanceRequest.count({
      where: {
        tenantId,
        status: {
          in: ['open', 'in_progress']
        }
      }
    });

    // Payment history (last 12 months)
    const paymentHistory = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthPayments = await prisma.payment.findMany({
        where: {
          tenantId,
          dueDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      });

      paymentHistory.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        paid: monthPayments.filter(p => p.status === 'paid').length,
        pending: monthPayments.filter(p => p.status === 'pending').length,
        overdue: monthPayments.filter(p => p.status === 'overdue').length,
        total: monthPayments.reduce((sum, p) => sum + p.amount, 0)
      });
    }

    // Lease timeline
    const allLeases = await prisma.lease.findMany({
      where: { tenantId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            addressLine: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: {
        overview: {
          currentLease: currentLease ? {
            propertyTitle: currentLease.property.title,
            monthlyRent: currentLease.rent,
            startDate: currentLease.startDate,
            endDate: currentLease.endDate,
            daysRemaining: Math.ceil((currentLease.endDate - now) / (1000 * 60 * 60 * 24))
          } : null,
          totalPaid: totalPaid._sum.amount || 0,
          pendingPayments,
          overduePayments,
          maintenanceRequests,
          pendingMaintenance
        },
        paymentHistory,
        leaseHistory: allLeases
      }
    });

  } catch (error) {
    console.error('Get tenant analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant analytics',
      error: error.message
    });
  }
};

// Get property analytics
export const getPropertyAnalytics = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : now;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        leases: {
          include: {
            payments: {
              where: {
                paidDate: {
                  gte: start,
                  lte: end
                },
                status: 'paid'
              }
            },
            tenant: {
              include: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        maintenanceRequests: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        },
        applications: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        },
        expenses: {
          where: {
            date: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Revenue calculation
    const totalRevenue = property.leases.reduce((sum, lease) => 
      sum + lease.payments.reduce((pSum, payment) => pSum + (payment.netAmount || 0), 0), 0
    );

    // Expenses calculation
    const totalExpenses = property.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Occupancy calculation
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    let occupiedDays = 0;

    property.leases.forEach(lease => {
      if (lease.status === 'active') {
        const leaseStart = lease.startDate > start ? lease.startDate : start;
        const leaseEnd = lease.endDate < end ? lease.endDate : end;
        occupiedDays += Math.ceil((leaseEnd - leaseStart) / (1000 * 60 * 60 * 24));
      }
    });

    const occupancyRate = totalDays > 0 ? (occupiedDays / totalDays) * 100 : 0;

    // Maintenance statistics
    const maintenanceStats = {
      total: property.maintenanceRequests.length,
      open: property.maintenanceRequests.filter(m => m.status === 'open').length,
      inProgress: property.maintenanceRequests.filter(m => m.status === 'in_progress').length,
      completed: property.maintenanceRequests.filter(m => m.status === 'completed').length,
      totalCost: property.maintenanceRequests
        .filter(m => m.cost)
        .reduce((sum, m) => sum + m.cost, 0)
    };

    res.json({
      success: true,
      data: {
        property: {
          id: property.id,
          title: property.title,
          status: property.status,
          price: property.price
        },
        financials: {
          totalRevenue,
          totalExpenses,
          netIncome: totalRevenue - totalExpenses,
          roi: property.price > 0 ? ((totalRevenue - totalExpenses) / property.price) * 100 : 0
        },
        occupancy: {
          occupancyRate: parseFloat(occupancyRate.toFixed(2)),
          occupiedDays,
          totalDays,
          currentTenant: property.leases.find(l => l.status === 'active')?.tenant?.user?.name || 'Vacant'
        },
        maintenance: maintenanceStats,
        inquiries: {
          total: property.applications.length,
          new: property.applications.filter(a => a.status === 'new').length,
          approved: property.applications.filter(a => a.status === 'approved').length,
          rejected: property.applications.filter(a => a.status === 'rejected').length
        },
        period: {
          start,
          end
        }
      }
    });

  } catch (error) {
    console.error('Get property analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property analytics',
      error: error.message
    });
  }
};

// Get financial reports
export const getFinancialReport = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { year, quarter } = req.query;

    const currentYear = year || new Date().getFullYear();
    let startDate, endDate;

    if (quarter) {
      const quarterStart = (parseInt(quarter) - 1) * 3;
      startDate = new Date(currentYear, quarterStart, 1);
      endDate = new Date(currentYear, quarterStart + 3, 0);
    } else {
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
    }

    // Income
    const rentIncome = await prisma.payment.aggregate({
      where: {
        lease: { landlordId },
        status: 'paid',
        paidDate: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true,
        netAmount: true,
        withholdingTax: true
      }
    });

    // Expenses by category
    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        landlordId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + (e._sum.amount || 0), 0);

    // Tax summary
    const taxSummary = {
      withholdingTax: rentIncome._sum.withholdingTax || 0,
      totalTaxLiability: rentIncome._sum.withholdingTax || 0
    };

    // Net income
    const netIncome = (rentIncome._sum.netAmount || 0) - totalExpenses;

    res.json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate,
          year: currentYear,
          quarter: quarter || 'Full Year'
        },
        income: {
          grossRent: rentIncome._sum.amount || 0,
          netRent: rentIncome._sum.netAmount || 0,
          totalIncome: rentIncome._sum.netAmount || 0
        },
        expenses: {
          byCategory: expenses.map(e => ({
            category: e.category,
            amount: e._sum.amount || 0
          })),
          total: totalExpenses
        },
        tax: taxSummary,
        netIncome,
        profitMargin: rentIncome._sum.amount > 0 
          ? (netIncome / rentIncome._sum.amount) * 100 
          : 0
      }
    });

  } catch (error) {
    console.error('Get financial report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate financial report',
      error: error.message
    });
  }
};