import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import {
	getAllProperties,
	getPropertyById,
	createProperty,
	updateProperty,
	deleteProperty
} from '../controller/propertyController.js';

const router = express.Router();

// Protect all property routes
router.use(authenticationMiddleware);

// Get all properties
router.get('/', getAllProperties);

// Get single property by ID
router.get('/:id', getPropertyById);

// Create property
router.post('/', createProperty);

// Update property
router.put('/:id', updateProperty);

// Delete property
router.delete('/:id', deleteProperty);

export default router;
