import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import {
	getAllPropertyImages,
	getPropertyImageById,
	createPropertyImage,
	updatePropertyImage,
	deletePropertyImage
} from '../controller/propertyImageController.js';

const router = express.Router();

// Protect all property image routes
router.use(authenticationMiddleware);

// Get all property images
router.get('/', getAllPropertyImages);

// Get single property image by ID
router.get('/:id', getPropertyImageById);

// Create property image
router.post('/', createPropertyImage);

// Update property image
router.put('/:id', updatePropertyImage);

// Delete property image
router.delete('/:id', deletePropertyImage);

export default router;
