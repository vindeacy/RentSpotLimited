import express from 'express';
import {
  getTenantDashboard,
  getLandlordDashboard,
  getQuickStats
} from '../controller/dashboardController.js';
import { authenticate, isTenant, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get tenant dashboard
router.get('/tenant', isTenant, getTenantDashboard);

// Get landlord dashboard
router.get('/landlord', isLandlord, getLandlordDashboard);

// Get quick stats
router.get('/stats', getQuickStats);

export default router;