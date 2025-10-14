import express from 'express';
import {
  getPublicProperties,
  getPublicPropertyById,
  getSearchSuggestions
} from '../controllers/publicPropertyController.js';

const router = express.Router();

// GET /api/public/properties - Get all properties (public access)
router.get('/', getPublicProperties);

// GET /api/public/properties/search/suggestions - Get search suggestions (public access)
router.get('/search/suggestions', getSearchSuggestions);

// GET /api/public/properties/:id - Get single property by ID (public access)
router.get('/:id', getPublicPropertyById);

export default router;
