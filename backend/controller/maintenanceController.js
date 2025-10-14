import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const maintenanceController = {
  // Get all maintenance requests for a tenant
  getTenantMaintenanceRequests: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const requests = await prisma.maintenanceRequest.findMany({
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

  // Create new maintenance request
  createMaintenanceRequest: async (req, res) => {
    try {
      const { tenantId, propertyId, title, description, priority, category } = req.body;
      
      const request = await prisma.maintenanceRequest.create({
        data: {
          tenantId,
          propertyId,
          title,
          description,
          priority: priority || 'medium',
          category,
          status: 'pending'
        },
        include: {
          property: true,
          tenant: {
            include: {
              user: true
            }
          }
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
      const { status, notes } = req.body;
      
      const request = await prisma.maintenanceRequest.update({
        where: { id: requestId },
        data: {
          status,
          notes,
          completedAt: status === 'completed' ? new Date() : null
        }
      });
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default maintenanceController;
