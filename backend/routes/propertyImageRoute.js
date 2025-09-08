import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { uploadPropertyImage } from '../Uploads/store.js';
import {
	getAllPropertyImages,
	getPropertyImageById,
	createPropertyImage,
	updatePropertyImage,
	deletePropertyImage
} from '../controller/propertyImageController.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';

const router = express.Router();

// Protect all property image routes
router.use(authenticationMiddleware);

// Get all property images
router.get('/', getAllPropertyImages);

// Upload property image (landlord or admin)
router.post('/upload', authorizeRoles('landlord', 'admin'), uploadPropertyImage.single('image'), (req, res) => {
  res.json({ url: `/PropertyImages/${req.file.filename}` });
});

// Update property image (landlord or admin)
router.put('/:id', authorizeRoles('landlord', 'admin'), updatePropertyImage);

// Get single property image by ID
router.get('/:id', getPropertyImageById);

// Create property image
router.post('/', authorizeRoles('landlord', 'admin'), createPropertyImage);

// Update property image
router.put('/:id', authorizeRoles('landlord', 'admin'), updatePropertyImage);

// Delete property image
router.delete('/:id', authorizeRoles('landlord', 'admin'), deletePropertyImage);

export default router;
