
import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { getUserProfile, getAllUsers, updateUserProfile, deleteUser } from '../controller/userController.js';

const router = express.Router();


// Protect all user routes with authenticationMiddleware
router.use(authenticationMiddleware);


// Get user profile
router.get('/profile', getUserProfile);

// Get all users (admin only)
router.get('/', getAllUsers);

// Update user profile
router.put('/profile', updateUserProfile);

// Delete user
router.delete('/:id', deleteUser);

export default router;
