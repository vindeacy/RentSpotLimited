import express from 'express';
import {
  uploadDocument,
  getDocumentById,
  getLandlordDocuments,
  getTenantDocuments,
  getPropertyDocuments,
  verifyDocument,
  updateDocument,
  deleteDocument,
  getExpiringDocuments,
  getDocumentCategories
} from '../controller/documentController.js';
import { authenticate, isLandlord, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Upload document
router.post('/upload', uploadDocument);

// Get document by ID
router.get('/:documentId', getDocumentById);

// Get landlord documents
router.get('/landlord/:landlordId', isLandlord, getLandlordDocuments);

// Get tenant documents
router.get('/tenant/:tenantId', getTenantDocuments);

// Get property documents
router.get('/property/:propertyId', getPropertyDocuments);

// Get expiring documents
router.get('/landlord/:landlordId/expiring', isLandlord, getExpiringDocuments);

// Get document categories
router.get('/categories/list', getDocumentCategories);

// Verify document (admin only)
router.patch('/:documentId/verify', isAdmin, verifyDocument);

// Update document
router.patch('/:documentId', updateDocument);

// Delete document
router.delete('/:documentId', deleteDocument);

export default router;