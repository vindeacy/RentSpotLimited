import express from 'express';
import maintenanceController from '../controller/maintenanceController.js';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';

const router = express.Router();

// Protect all maintenance routes
router.use(authenticationMiddleware);

// Get maintenance requests for tenant
router.get('/tenant/:tenantId', authorizeRoles('tenant'), maintenanceController.getTenantMaintenanceRequests);

// Get maintenance requests for landlord
router.get('/landlord/:landlordId', authorizeRoles('landlord'), maintenanceController.getLandlordMaintenanceRequests);

// Create new maintenance request
router.post('/', authorizeRoles('tenant'), maintenanceController.createMaintenanceRequest);

// Update maintenance request (tenant only)
router.put('/:requestId', authorizeRoles('tenant'), maintenanceController.updateTenantMaintenanceRequest);

// Delete maintenance request (tenant only)
router.delete('/:requestId', authorizeRoles('tenant'), maintenanceController.deleteTenantMaintenanceRequest);

// Update maintenance request status (landlord only)
router.put('/:requestId/status', authorizeRoles('landlord'), maintenanceController.updateMaintenanceStatus);

// Get single maintenance request
router.get('/:requestId', maintenanceController.getMaintenanceRequest);

// Rate maintenance completion (tenant only)
router.put('/:requestId/rate', authorizeRoles('tenant'), maintenanceController.rateMaintenance);

// Upload maintenance images
router.post('/:requestId/images', maintenanceController.uploadMaintenanceImages);

export default router;
