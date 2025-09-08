import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all tenants
export async function getAllTenants(req, res) {
	try {
		const tenants = await prisma.tenant.findMany({
			include: { user: true, leases: true }
		});
		res.json({ tenants });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch tenants.' });
	}
}

// Get single tenant by ID
export async function getTenantById(req, res) {
	try {
		const { id } = req.params;
		const tenant = await prisma.tenant.findUnique({
			where: { id },
			include: { user: true, leases: true }
		});
		if (!tenant) return res.status(404).json({ error: 'Tenant not found.' });
		res.json({ tenant });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch tenant.' });
	}
}

// Create tenant
//will add the leaseID later using the 'put/patch' method after creating the lease
export async function createTenant(req, res) {
  try {
    const { userId, dob, idDocUrl, verified } = req.body;

    // Check if user exists and is a tenant
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'tenant') {
      return res.status(400).json({ error: 'User must exist and have role tenant.' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        userId,
        dob: dob ? new Date(dob) : undefined,
        idDocUrl,
        verified: verified ?? false
      }
    });

    res.status(201).json({ tenant });
  } catch (err) {
    console.error('Create tenant error:', err);
    res.status(500).json({ error: 'Failed to create tenant.' });
  }
}

// Update tenant
export async function updateTenant(req, res) {
	try {
		const { id } = req.params;
		const { dob, idDocUrl } = req.body;
		const tenant = await prisma.tenant.update({
			where: { id },
			data: { dob, idDocUrl }
		});
		res.json({ tenant });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update tenant.' });
	}
}

// Delete tenant
export async function deleteTenant(req, res) {
	try {
		const { id } = req.params;
		await prisma.tenant.delete({ where: { id } });
		res.json({ message: 'Tenant deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete tenant.' });
	}
}
