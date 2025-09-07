import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';
import {
	getAllLandlords,
	getLandlordById,
	createLandlord,
	updateLandlord,
	deleteLandlord
} from '../controller/landLordController.js';

const router = express.Router();

// Protect all landlord routes
router.use(authenticationMiddleware);

// Get all landlords (admin only)
router.get('/', authorizeRoles('admin'), getAllLandlords);

// Get single landlord by ID (admin, landlord)
router.get('/:id', authorizeRoles('admin', 'landlord'), getLandlordById);

// Create landlord (admin only)
router.post('/', authorizeRoles('admin'), createLandlord);

// Update landlord (admin, landlord)
router.put('/:id', authorizeRoles('admin', 'landlord'), updateLandlord);

// Delete landlord (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteLandlord);

export default router;
