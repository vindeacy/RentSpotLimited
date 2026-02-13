import express from 'express';
import {
  getLandlordActivityLogs,
  getTenantActivityLogs,
  getRecentActivity,
  getActivityByEntity,
  deleteOldActivityLogs
} from '../controller/activityLogController.js';
import { authenticate, isLandlord, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get landlord activity logs
router.get('/landlord/:landlordId', isLandlord, getLandlordActivityLogs);

// Get tenant activity logs
router.get('/tenant/:tenantId', getTenantActivityLogs);

// Get recent activity
router.get('/recent', getRecentActivity);

// Get activity by entity
router.get('/entity/:entityType/:entityId', getActivityByEntity);

// Delete old activity logs (admin only)
router.delete('/cleanup', isAdmin, deleteOldActivityLogs);

export default router;