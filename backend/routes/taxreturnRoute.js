import express from 'express';
import {
  createTaxReturn,
  getTaxReturnById,
  getLandlordTaxReturns,
  submitTaxReturn,
  updateTaxReturn,
  deleteTaxReturn,
  getTaxSummary
} from '../controller/taxReturnController.js';
import { authenticate, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create tax return
router.post('/', isLandlord, createTaxReturn);

// Get tax return by ID
router.get('/:taxReturnId', isLandlord, getTaxReturnById);

// Get landlord tax returns
router.get('/landlord/:landlordId', isLandlord, getLandlordTaxReturns);

// Submit tax return to KRA
router.post('/:taxReturnId/submit', isLandlord, submitTaxReturn);

// Update tax return
router.patch('/:taxReturnId', isLandlord, updateTaxReturn);

// Delete tax return
router.delete('/:taxReturnId', isLandlord, deleteTaxReturn);

// Get tax summary
router.get('/summary/:landlordId', isLandlord, getTaxSummary);

export default router;