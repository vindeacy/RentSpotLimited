import express from 'express';
import {
  createReview,
  getReviewById,
  getPropertyReviews,
  getLandlordReviews,
  respondToReview,
  updateReview,
  deleteReview,
  markHelpful
} from '../controller/reviewController.js';
import { authenticate, isTenant, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/property/:propertyId', getPropertyReviews);
router.get('/landlord/:landlordId', getLandlordReviews);
router.get('/:reviewId', getReviewById);

// Protected routes
router.use(authenticate);

// Create review (tenant only)
router.post('/', isTenant, createReview);

// Respond to review (landlord only)
router.post('/:reviewId/respond', isLandlord, respondToReview);

// Update review (tenant only)
router.patch('/:reviewId', isTenant, updateReview);

// Delete review
router.delete('/:reviewId', deleteReview);

// Mark review as helpful
router.post('/:reviewId/helpful', markHelpful);

export default router;