import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all leases
export async function getAllLeases(req, res) {
	try {
		const leases = await prisma.lease.findMany({
			include: { property: true, tenant: true, landlord: true }
		});
		res.json({ leases });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch leases.' });
	}
}

// Get single lease by ID
export async function getLeaseById(req, res) {
	try {
		const { id } = req.params;
		const lease = await prisma.lease.findUnique({
			where: { id },
			include: { property: true, tenant: true, landlord: true }
		});
		if (!lease) return res.status(404).json({ error: 'Lease not found.' });
		res.json({ lease });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch lease.' });
	}
}

// Create lease
export async function createLease(req, res) {
	try {
		const { propertyId, tenantId, landlordId, startDate, endDate, rent, status } = req.body;
		const lease = await prisma.lease.create({
			data: { propertyId, tenantId, landlordId, startDate, endDate, rent, status }
		});
		res.status(201).json({ lease });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create lease.' });
	}
}

// Update lease
export async function updateLease(req, res) {
	try {
		const { id } = req.params;
		const { startDate, endDate, rent, status } = req.body;
		const lease = await prisma.lease.update({
			where: { id },
			data: { startDate, endDate, rent, status }
		});
		res.json({ lease });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update lease.' });
	}
}

// Delete lease
export async function deleteLease(req, res) {
	try {
		const { id } = req.params;
		await prisma.lease.delete({ where: { id } });
		res.json({ message: 'Lease deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete lease.' });
	}
}
