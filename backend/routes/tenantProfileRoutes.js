import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get tenant profile
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        user: true,
        currentProperty: true,
        leases: {
          include: {
            property: true
          }
        }
      }
    });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ...existing code from previous response...

export default router;
