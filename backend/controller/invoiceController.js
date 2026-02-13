import db from '../lib/db.js';

// Generate invoice for payment
const generateInvoice = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            property: true,
            landlord: {
              include: { user: true }
            }
          }
        },
        tenant: {
          include: { user: true }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if invoice already exists
    const existingInvoice = await db.invoice.findUnique({
      where: { paymentId }
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists for this payment',
        data: existingInvoice
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}-${paymentId.substring(0, 8)}`;

    // Create invoice items
    const itemsJson = {
      items: [
        {
          description: `Rent - ${payment.lease.property.title}`,
          property: payment.lease.property.addressLine,
          period: `${new Date(payment.dueDate).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount
        }
      ],
      subtotal: payment.amount,
      withholdingTax: payment.withholdingTax || 0,
      vatAmount: payment.vatAmount || 0,
      total: payment.netAmount || payment.amount
    };

    const invoice = await db.invoice.create({
      data: {
        landlordId: payment.lease.landlordId,
        paymentId: payment.id,
        invoiceNumber,
        amount: payment.amount,
        tax: payment.withholdingTax || 0,
        total: payment.netAmount || payment.amount,
        dueDate: payment.dueDate,
        status: payment.status === 'paid' ? 'paid' : 'pending',
        paidDate: payment.paidDate,
        description: `Rent invoice for ${payment.lease.property.title}`,
        itemsJson,
        kraSubmitted: payment.kraReported,
        kraReceiptNo: payment.kraReceiptNo
      },
      include: {
        landlord: {
          include: { user: true }
        },
        payment: {
          include: {
            tenant: {
              include: { user: true }
            },
            lease: {
              include: { property: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: error.message
    });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        landlord: {
          include: { user: true }
        },
        payment: {
          include: {
            tenant: {
              include: { user: true }
            },
            lease: {
              include: { property: true }
            }
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Get landlord invoices
const getLandlordInvoices = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const where = { landlordId };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const invoices = await db.invoice.findMany({
      where,
      include: {
        payment: {
          include: {
            tenant: {
              include: { user: { select: { name: true, email: true } } }
            },
            lease: {
              include: { property: { select: { title: true } } }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await db.invoice.count({ where });

    res.json({
      success: true,
      count: invoices.length,
      totalCount,
      invoices
    });

  } catch (error) {
    console.error('Get landlord invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Update invoice status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status, kraSubmitted, kraReceiptNo } = req.body;

    const invoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        kraSubmitted: kraSubmitted !== undefined ? kraSubmitted : undefined,
        kraReceiptNo: kraReceiptNo || undefined,
        paidDate: status === 'paid' ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Get invoice statistics
const getInvoiceStatistics = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { year, month } = req.query;

    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, month ? month - 1 : 0, 1);
    const endDate = month 
      ? new Date(currentYear, month, 0)
      : new Date(currentYear, 11, 31);

    const invoices = await db.invoice.findMany({
      where: {
        landlordId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const statistics = {
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
      pendingInvoices: invoices.filter(i => i.status === 'pending').length,
      overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
      totalPaid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
      totalPending: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0),
      totalTax: invoices.reduce((sum, i) => sum + (i.tax || 0), 0),
      kraSubmitted: invoices.filter(i => i.kraSubmitted).length
    };

    res.json({
      success: true,
      period: { startDate, endDate },
      statistics
    });

  } catch (error) {
    console.error('Get invoice statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice statistics',
      error: error.message
    });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    await db.invoice.delete({
      where: { id: invoiceId }
    });

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

export {
  generateInvoice,
  getInvoiceById,
  getLandlordInvoices,
  updateInvoiceStatus,
  getInvoiceStatistics,
  deleteInvoice
};