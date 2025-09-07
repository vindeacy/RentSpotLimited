import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import {
	getAllApplications,
	getApplicationById,
	createApplication,
	updateApplication,
	deleteApplication
} from '../controller/applicationController.js';

const router = express.Router();

// Protect all application routes
router.use(authenticationMiddleware);

// Get all applications
router.get('/', getAllApplications);

// Get single application by ID
router.get('/:id', getApplicationById);

// Create application
router.post('/', createApplication);

// Update application
router.put('/:id', updateApplication);

// Delete application
router.delete('/:id', deleteApplication);

export default router;
