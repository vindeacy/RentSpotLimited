import express from 'express';
import {
  generateInvoice,
  getInvoiceById,
  getLandlordInvoices,
  updateInvoiceStatus,
  getInvoiceStatistics,
  deleteInvoice
} from '../controller/invoiceController.js';
import { authenticate, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Generate invoice
router.post('/generate', isLandlord, generateInvoice);

// Get invoice by ID
router.get('/:invoiceId', getInvoiceById);

// Get landlord invoices
router.get('/landlord/:landlordId', isLandlord, getLandlordInvoices);

// Update invoice status
router.patch('/:invoiceId/status', isLandlord, updateInvoiceStatus);

// Get invoice statistics
router.get('/statistics/:landlordId', isLandlord, getInvoiceStatistics);

// Delete invoice
router.delete('/:invoiceId', isLandlord, deleteInvoice);

export default router;