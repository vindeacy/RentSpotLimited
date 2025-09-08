import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controller/propertyController.js';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';

const router = express.Router();

// Protect all property routes
router.use(authenticationMiddleware);

// Get all properties (any authenticated user)
router.get('/', getAllProperties);

// Get single property by ID
router.get('/:id', getPropertyById);

// Create property (admin or landlord)
router.post('/', authorizeRoles('admin', 'landlord'), createProperty);

// Update property (admin or landlord)
router.put('/:id', authorizeRoles('admin', 'landlord'), updateProperty);

// Delete property (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteProperty);

export default router;