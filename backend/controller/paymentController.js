import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const paymentController = {
  // Get all payments for a tenant
  getTenantPayments: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const payments = await prisma.payment.findMany({
        where: { tenantId },
        include: {
          lease: {
            include: {
              property: true
            }
          }
        },
        orderBy: { dueDate: 'desc' }
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Record a new payment
  createPayment: async (req, res) => {
    try {
      const { tenantId, leaseId, amount, dueDate, paymentMethod } = req.body;
      const payment = await prisma.payment.create({
        data: {
          tenantId,
          leaseId,
          amount,
          dueDate,
          paymentMethod,
          status: 'pending'
        },
        include: {
          lease: {
            include: {
              property: true
            }
          }
        }
      });
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { status, paidDate, reference, notes } = req.body;
      
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paidDate: status === 'paid' ? paidDate || new Date() : null,
          reference,
          notes
        }
      });
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get payment statistics
  getPaymentStats: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const stats = await prisma.payment.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true },
        _sum: { amount: true }
      });
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default paymentController;
