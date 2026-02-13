import express from 'express';
import {
  createPayment,
  recordPayment,
  getTenantPayments,
  getLandlordPayments,
  getPaymentById,
  checkOverduePayments,
  getPaymentStatistics
} from '../controller/paymentController.js';
import { authenticate, isLandlord, isTenant } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create payment (landlord only)
router.post('/', isLandlord, createPayment);

// Record payment (tenant pays)
router.patch('/:paymentId/pay', recordPayment);

// Get tenant payments
router.get('/tenant/:tenantId', getTenantPayments);

// Get landlord payments
router.get('/landlord/:landlordId', isLandlord, getLandlordPayments);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Check and update overdue payments
router.post('/check-overdue', checkOverduePayments);

// Get payment statistics
router.get('/statistics/summary', getPaymentStatistics);

export default router;