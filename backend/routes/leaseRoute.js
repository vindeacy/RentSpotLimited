import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
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

// Get all leases
router.get('/', getAllLeases);

// Get single lease by ID
router.get('/:id', getLeaseById);

// Create lease
router.post('/', createLease);

// Update lease
router.put('/:id', updateLease);

// Delete lease
router.delete('/:id', deleteLease);

export default router;
