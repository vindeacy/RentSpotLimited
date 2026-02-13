import express from 'express';
import tenantProfileController from '../controller/tenantProfileController.js';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';

const router = express.Router();

// Protect all tenant profile routes
router.use(authenticationMiddleware);

// Get tenant profile (tenant or landlord)
router.get('/:tenantId', tenantProfileController.getTenantProfile);

// Update emergency contacts (tenant only)
router.put('/:tenantId/emergency-contact', authorizeRoles('tenant'), tenantProfileController.updateEmergencyContact);

// Update tenant preferences (tenant only)
router.put('/:tenantId/preferences', authorizeRoles('tenant'), tenantProfileController.updateTenantPreferences);

// Update rental information (tenant only)
router.put('/:tenantId/rental-info', authorizeRoles('tenant'), tenantProfileController.updateRentalInfo);

// Update payment preferences (tenant only)
router.put('/:tenantId/payment-preferences', authorizeRoles('tenant'), tenantProfileController.updatePaymentPreferences);

// Update profile completeness (tenant only)
router.put('/:tenantId/profile-completeness', authorizeRoles('tenant'), tenantProfileController.updateProfileCompleteness);

export default router;
