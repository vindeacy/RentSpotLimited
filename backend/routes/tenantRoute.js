import express from 'express';
import { authenticationMiddleware } from '../Middleware/authenticationMiddleware.js';
import { authorizeRoles } from '../Middleware/authorizationMiddleware.js';
import {
    getAllTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant
} from '../controller/tenantController.js';
import { upload } from '../Uploads/store.js';

const router = express.Router();

// Protect all tenant routes
router.use(authenticationMiddleware);

// Upload tenant ID document
router.post('/upload', upload.single('idDoc'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Get all tenants (admin and landlord only)
router.get('/', authorizeRoles('admin', 'landlord'), getAllTenants);

// Get single tenant by ID (admin and landlord only)
router.get('/:id', authorizeRoles('admin', 'landlord'), getTenantById);

// Create tenant (admin and landlord only)
router.post('/', authorizeRoles('admin', 'landlord'), createTenant);

// Update tenant (admin and landlord only)
router.put('/:id', authorizeRoles('admin', 'landlord'), updateTenant);

// Delete tenant (admin only)
router.delete('/:id', authorizeRoles('admin'), deleteTenant);

export default router;