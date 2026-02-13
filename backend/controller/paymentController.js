import db from '../lib/db.js';

// Calculate tax amounts
const calculateTaxAmounts = (amount) => {
  const withholdingTaxRate = 0.10; // 10% withholding tax on rent
  const withholdingTax = amount * withholdingTaxRate;
  const netAmount = amount - withholdingTax;

  return {
    amount,
    withholdingTax,
    netAmount,
    vatAmount: 0 // VAT typically not applicable on residential rent
  };
};

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const { tenantId, leaseId, amount, dueDate, paymentMethod } = req.body;

    if (!tenantId || !leaseId || !amount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID, Lease ID, amount, and due date are required'
      });
    }

    // Calculate tax amounts
    const taxCalculation = calculateTaxAmounts(parseFloat(amount));

    const payment = await db.payment.create({
      data: {
        tenantId,
        leaseId,
        amount: taxCalculation.amount,
        withholdingTax: taxCalculation.withholdingTax,
        vatAmount: taxCalculation.vatAmount,
        netAmount: taxCalculation.netAmount,
        dueDate: new Date(dueDate),
        paymentMethod: paymentMethod || 'pending',
        status: 'pending'
      },
      include: {
        tenant: {
          include: { user: true }
        },
        lease: {
          include: { property: true }
        }
      }
    });

    // Create notification for tenant
    await db.notification.create({
      data: {
        userId: payment.tenant.userId,
        tenantId: payment.tenantId,
        type: 'payment_due',
        title: 'Payment Due',
        message: `Rent payment of KSh ${amount.toLocaleString()} is due on ${new Date(dueDate).toLocaleDateString()}`,
        link: `/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          amount: taxCalculation.amount,
          dueDate
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment,
      taxBreakdown: taxCalculation
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Record payment (when tenant pays)
const recordPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, reference, kraReceiptNo } = req.body;

    const payment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: paymentMethod || 'M-Pesa',
        reference,
        kraReceiptNo,
        kraReported: !!kraReceiptNo
      },
      include: {
        tenant: {
          include: { user: true }
        },
        lease: {
          include: {
            property: true,
            landlord: {
              include: { user: true }
            }
          }
        }
      }
    });

    // Generate invoice if not exists
    const existingInvoice = await db.invoice.findUnique({
      where: { paymentId: payment.id }
    });

    if (!existingInvoice) {
      await db.invoice.create({
        data: {
          landlordId: payment.lease.landlordId,
          paymentId: payment.id,
          invoiceNumber: `INV-${Date.now()}-${payment.id.substring(0, 8)}`,
          amount: payment.amount,
          tax: payment.withholdingTax,
          total: payment.netAmount,
          dueDate: payment.dueDate,
          status: 'paid',
          paidDate: payment.paidDate,
          description: `Rent payment for ${payment.lease.property.title}`,
          itemsJson: {
            items: [
              {
                description: `Monthly Rent - ${payment.lease.property.title}`,
                quantity: 1,
                unitPrice: payment.amount,
                total: payment.amount
              }
            ],
            subtotal: payment.amount,
            withholdingTax: payment.withholdingTax,
            total: payment.netAmount
          },
          kraSubmitted: !!payment.kraReceiptNo,
          kraReceiptNo: payment.kraReceiptNo
        }
      });
    }

    // Create notifications
    await db.notification.create({
      data: {
        userId: payment.tenant.userId,
        tenantId: payment.tenantId,
        type: 'payment_confirmed',
        title: 'Payment Confirmed',
        message: `Your payment of KSh ${payment.amount.toLocaleString()} has been confirmed`,
        link: `/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          amount: payment.amount,
          reference
        }
      }
    });

    await db.notification.create({
      data: {
        userId: payment.lease.landlord.userId,
        landlordId: payment.lease.landlordId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of KSh ${payment.netAmount.toLocaleString()} received from ${payment.tenant.user.name}`,
        link: `/payments/${payment.id}`,
        metadata: {
          paymentId: payment.id,
          tenantName: payment.tenant.user.name,
          amount: payment.netAmount
        }
      }
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        landlordId: payment.lease.landlordId,
        tenantId: payment.tenantId,
        action: 'payment_received',
        description: `Payment of KSh ${payment.amount.toLocaleString()} received`,
        entityType: 'Payment',
        entityId: payment.id,
        metadata: {
          amount: payment.amount,
          netAmount: payment.netAmount,
          withholdingTax: payment.withholdingTax,
          paymentMethod,
          reference
        }
      }
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// Get payment history for tenant
const getTenantPayments = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status, startDate, endDate } = req.query;

    const where = { tenantId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        lease: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                addressLine: true,
                city: true
              }
            }
          }
        },
        invoice: true
      },
      orderBy: { dueDate: 'desc' }
    });

    const summary = {
      totalPaid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
      totalWithholdingTax: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.withholdingTax || 0), 0)
    };

    res.json({
      success: true,
      count: payments.length,
      summary,
      payments
    });

  } catch (error) {
    console.error('Get tenant payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment history for landlord
const getLandlordPayments = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { status, propertyId, startDate, endDate } = req.query;

    const where = {
      lease: {
        landlordId
      }
    };

    if (status) {
      where.status = status;
    }

    if (propertyId) {
      where.lease.propertyId = propertyId;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        tenant: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        lease: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                addressLine: true,
                city: true
              }
            }
          }
        },
        invoice: true
      },
      orderBy: { dueDate: 'desc' }
    });

    const summary = {
      totalReceived: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.netAmount || 0), 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
      totalWithholdingTax: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.withholdingTax || 0), 0)
    };

    res.json({
      success: true,
      count: payments.length,
      summary,
      payments
    });

  } catch (error) {
    console.error('Get landlord payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get single payment details
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: {
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true }
            }
          }
        },
        lease: {
          include: {
            property: true,
            landlord: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true, companyName: true }
                }
              }
            }
          }
        },
        invoice: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Check and update overdue payments
const checkOverduePayments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = await db.payment.updateMany({
      where: {
        status: 'pending',
        dueDate: {
          lt: today
        }
      },
      data: {
        status: 'overdue'
      }
    });

    // Notify tenants with overdue payments
    const overdueDetails = await db.payment.findMany({
      where: {
        status: 'overdue',
        dueDate: {
          lt: today
        }
      },
      include: {
        tenant: {
          include: { user: true }
        }
      }
    });

    for (const payment of overdueDetails) {
      await db.notification.create({
        data: {
          userId: payment.tenant.userId,
          tenantId: payment.tenantId,
          type: 'payment_overdue',
          title: 'Payment Overdue',
          message: `Your rent payment of KSh ${payment.amount.toLocaleString()} is overdue`,
          link: `/payments/${payment.id}`,
          priority: 'high',
          metadata: {
            paymentId: payment.id,
            amount: payment.amount,
            dueDate: payment.dueDate
          }
        }
      });
    }

    res.json({
      success: true,
      message: `${overduePayments.count} payments marked as overdue`,
      count: overduePayments.count
    });

  } catch (error) {
    console.error('Check overdue payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check overdue payments',
      error: error.message
    });
  }
};

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    const { landlordId, tenantId, year, month } = req.query;

    let where = {};

    if (landlordId) {
      where.lease = { landlordId };
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (year) {
      const startDate = new Date(year, month ? month - 1 : 0, 1);
      const endDate = month 
        ? new Date(year, month, 0)
        : new Date(year, 11, 31);

      where.paidDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const payments = await db.payment.findMany({
      where: {
        ...where,
        status: 'paid'
      }
    });

    const statistics = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      totalNetAmount: payments.reduce((sum, p) => sum + (p.netAmount || 0), 0),
      totalTaxWithheld: payments.reduce((sum, p) => sum + (p.withholdingTax || 0), 0),
      averagePayment: payments.length > 0 
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
        : 0,
      paymentMethods: {},
      monthlyBreakdown: {}
    };

    // Group by payment method
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'Unknown';
      statistics.paymentMethods[method] = (statistics.paymentMethods[method] || 0) + 1;
    });

    // Monthly breakdown
    payments.forEach(payment => {
      if (payment.paidDate) {
        const monthKey = payment.paidDate.toISOString().substring(0, 7);
        if (!statistics.monthlyBreakdown[monthKey]) {
          statistics.monthlyBreakdown[monthKey] = {
            count: 0,
            total: 0,
            netTotal: 0
          };
        }
        statistics.monthlyBreakdown[monthKey].count++;
        statistics.monthlyBreakdown[monthKey].total += payment.amount;
        statistics.monthlyBreakdown[monthKey].netTotal += (payment.netAmount || 0);
      }
    });

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Get payment statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
};

export {
  createPayment,
  recordPayment,
  getTenantPayments,
  getLandlordPayments,
  getPaymentById,
  checkOverduePayments,
  getPaymentStatistics,
  calculateTaxAmounts
};