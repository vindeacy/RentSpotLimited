import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';
import {
	getAllTenants,
	getTenantById,
	createTenant,
	updateTenant,
	deleteTenant
} from '../controller/tenantController.js';

const router = express.Router();

// Protect all tenant routes
router.use(authenticationMiddleware);

// Get all tenants (admin only)
router.get('/', authorizeRoles('admin'), getAllTenants);

// Get single tenant by ID (admin, tenant)
router.get('/:id', authorizeRoles('admin', 'tenant'), getTenantById);

// Create tenant (admin only)
router.post('/', authorizeRoles('admin'), createTenant);

// Update tenant (admin, tenant)
router.put('/:id', authorizeRoles('admin', 'tenant'), updateTenant);

// Delete tenant (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteTenant);

export default router;
