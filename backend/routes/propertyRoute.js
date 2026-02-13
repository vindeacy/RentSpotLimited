import express from 'express';
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
  // toggleFeaturedStatus // Uncomment if you have this in your controller
} from '../controller/propertyController.js'; 

import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';

const router = express.Router();

// Publicly accessible within this router (if needed) or keep private
router.get('/', authenticationMiddleware, getAllProperties);
router.get('/:id', authenticationMiddleware, getPropertyById);

// Protected routes
router.post('/', authenticationMiddleware, authorizeRoles('admin', 'landlord'), createProperty);
router.put('/:id', authenticationMiddleware, authorizeRoles('admin', 'landlord'), updateProperty);
router.delete('/:id', authenticationMiddleware, authorizeRoles('admin'), deleteProperty);

// The featured toggle you mentioned
// router.put('/:id/featured', authenticationMiddleware, authorizeRoles('admin', 'landlord'), toggleFeaturedStatus);

export default router;