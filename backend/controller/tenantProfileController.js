import db from '../lib/db.js';

const tenantProfileController = {
  // Get tenant profile
  getTenantProfile: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
        include: {
          user: true,
          currentProperty: {
            include: {
              landlord: {
                include: {
                  user: true
                }
              }
            }
          },
          leases: {
            include: {
              property: {
                include: {
                  landlord: {
                    include: {
                      user: true
                    }
                  }
                }
              },
              landlord: {
                include: {
                  user: true
                }
              }
            }
          },
          payments: true,
          maintenanceRequests: true,
          notifications: true
        }
      });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update emergency contacts
  updateEmergencyContact: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { emergencyContactName, emergencyContactPhone, emergencyContactEmail, emergencyContactRelation } = req.body;
      
      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactEmail,
          emergencyContactRelation
        }
      });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update tenant preferences
  updateTenantPreferences: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { maxRent, preferredAreas, petOwner, smokingStatus } = req.body;
      
      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          maxRent,
          preferredAreas,
          petOwner,
          smokingStatus
        }
      });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update rental information
  updateRentalInfo: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { currentPropertyId, moveInDate, previousAddress } = req.body;

      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          currentPropertyId,
          moveInDate,
          previousAddress
        }
      });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update payment preferences
  updatePaymentPreferences: async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { preferredPaymentMethod, bankAccountInfo } = req.body;
      
      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          preferredPaymentMethod,
          bankAccountInfo
        }
      });
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Check and update profile completeness
  updateProfileCompleteness: async (req, res) => {
    try {
      const { tenantId } = req.params;

      const tenant = await db.tenant.findUnique({
        where: { id: tenantId }
      });

      const profileCompleted = !!(
        tenant.emergencyContactName &&
        tenant.emergencyContactPhone &&
        tenant.preferredPaymentMethod
      );

      const updatedTenant = await db.tenant.update({
        where: { id: tenantId },
        data: { profileCompleted }
      });

      res.json(updatedTenant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default tenantProfileController;
