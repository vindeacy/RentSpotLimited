import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';
import {
    getAllLeases,
    getLeaseById,
    createLease,
    updateLease,
    deleteLease
} from '../controller/leaseController.js';

const router = express.Router();

// Protect all lease routes
router.use(authenticationMiddleware);

// Get all leases (admin, landlord)
router.get('/', authorizeRoles('admin', 'landlord'), getAllLeases);

// Get single lease by ID (admin, landlord)
router.get('/:id', authorizeRoles('admin', 'landlord'), getLeaseById);

// Create lease (admin, landlord)
router.post('/', authorizeRoles('admin', 'landlord'), createLease);

// Update lease (admin, landlord)
router.put('/:id', authorizeRoles('admin', 'landlord'), updateLease);

// Delete lease (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteLease);

export default router;