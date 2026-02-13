import db from '../lib/db.js';


const maintenanceController = {
  // Get all maintenance requests for a tenant
  getTenantMaintenanceRequests: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const requests = await db.maintenanceRequest.findMany({
        where: { tenantId },
        include: {
          property: true,
          tenant: {
            include: {
              user: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all maintenance requests for a landlord
  getLandlordMaintenanceRequests: async (req, res) => {
    try {
      const { landlordId } = req.params;
      const requests = await db.maintenanceRequest.findMany({
        where: { landlordId },
        include: {
          property: true,
          tenant: {  // This gives landlord full tenant info
            include: {
              user: {  // This includes tenant's name, email, phone from User model
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          },
          landlord: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new maintenance request
  createMaintenanceRequest: async (req, res) => {
    try {
      const { tenantId, propertyId, title, description, priority, category, images } = req.body;
      
      // Get landlordId from property
      const property = await db.property.findUnique({
        where: { id: propertyId }
      });

      const request = await db.maintenanceRequest.create({
        data: {
          tenantId,
          propertyId,
          landlordId: property.landlordId,
          title,
          description,
          priority: priority || 'medium',
          category,
          images: images || [],
          status: 'open'
        },
        include: {
          property: true,
          tenant: {
            include: {
              user: true
            }
          },
          landlord: true
        }
      });
      res.status(201).json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update maintenance request status
  updateMaintenanceStatus: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, landlordNotes, cost, assignedTo, scheduledDate } = req.body;
      
      const updateData = {
        status,
        landlordNotes
        // Remove: updatedAt: new Date() - db handles this automatically
      };

      // Handle completion logic
      if (status === 'completed') {
        updateData.completedDate = new Date();
        if (cost) updateData.cost = cost;
      }

      // Handle assignment and scheduling
      if (assignedTo) updateData.assignedTo = assignedTo;
      if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);

      const request = await db.maintenanceRequest.update({
        where: { id: requestId },
        data: updateData,
        include: {
          property: true,
          tenant: { include: { user: true } },
          landlord: true
        }
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update maintenance request (tenant only)
  updateTenantMaintenanceRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const tenantId = req.user?.tenantId;
      const { title, description, priority, category, images } = req.body;

      if (!tenantId) {
        return res.status(403).json({ error: 'Unauthorized tenant access' });
      }

      const existing = await db.maintenanceRequest.findUnique({
        where: { id: requestId }
      });

      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      if (['completed', 'cancelled'].includes(existing.status)) {
        return res.status(400).json({ error: 'Cannot edit completed or cancelled requests' });
      }

      const request = await db.maintenanceRequest.update({
        where: { id: requestId },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(priority && { priority }),
          ...(category && { category }),
          ...(images && { images })
        },
        include: {
          property: true,
          tenant: { include: { user: true } },
          landlord: true
        }
      });

      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete maintenance request (tenant only)
  deleteTenantMaintenanceRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        return res.status(403).json({ error: 'Unauthorized tenant access' });
      }

      const existing = await db.maintenanceRequest.findUnique({
        where: { id: requestId }
      });

      if (!existing || existing.tenantId !== tenantId) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      if (existing.status !== 'open') {
        return res.status(400).json({ error: 'Only open requests can be deleted' });
      }

      await db.maintenanceRequest.delete({ where: { id: requestId } });
      res.json({ message: 'Maintenance request deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get single maintenance request
  getMaintenanceRequest: async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await db.maintenanceRequest.findUnique({
        where: { id: requestId },
        include: {
          property: true,
          tenant: { include: { user: true } },
          landlord: true
        }
      });
      if (!request) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Rate maintenance completion (tenant rating)
  rateMaintenance: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { tenantRating } = req.body;
      
      const request = await db.maintenanceRequest.update({
        where: { id: requestId },
        data: { tenantRating },
        include: {
          property: true,
          tenant: { include: { user: true } },
          landlord: true
        }
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Upload maintenance images
  uploadMaintenanceImages: async (req, res) => {
    try {
      const { requestId } = req.params;
      const imageUrls = req.files?.map(file => file.path) || [];
      
      const request = await db.maintenanceRequest.update({
        where: { id: requestId },
        data: {
          images: {
            push: imageUrls
          }
        }
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default maintenanceController;
