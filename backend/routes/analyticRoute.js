import express from 'express';
import {
  getLandlordAnalytics,
  getTenantAnalytics,
  getPropertyAnalytics,
  getFinancialReport
} from '../controller/analyticsController.js';
import { authenticate, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get landlord analytics
router.get('/landlord/:landlordId', isLandlord, getLandlordAnalytics);

// Get tenant analytics
router.get('/tenant/:tenantId', getTenantAnalytics);

// Get property analytics
router.get('/property/:propertyId', getPropertyAnalytics);

// Get financial report
router.get('/financial/:landlordId', isLandlord, getFinancialReport);

export default router;