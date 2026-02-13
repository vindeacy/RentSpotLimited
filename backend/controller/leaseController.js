import db from '../lib/db.js';
// Get all leases
export async function getAllLeases(req, res) {
    try {
        const leases = await db.lease.findMany({
            include: { property: true, tenant: true, landlord: true }
        });
        res.json({ leases });
    } catch (err) {
        console.error('Get all leases error:', err);
        res.status(500).json({ error: 'Failed to fetch leases.' });
    }
}

// Get single lease by ID
export async function getLeaseById(req, res) {
    try {
        const { id } = req.params;
        const lease = await db.lease.findUnique({
            where: { id },
            include: { property: true, tenant: true, landlord: true }
        });
        if (!lease) return res.status(404).json({ error: 'Lease not found.' });
        res.json({ lease });
    } catch (err) {
        console.error('Get lease by ID error:', err);
        res.status(500).json({ error: 'Failed to fetch lease.' });
    }
}

// Create lease
export async function createLease(req, res) {
    try {
        const { propertyId, tenantId, landlordId, startDate, endDate, rent, status } = req.body;
        const lease = await db.lease.create({
            data: {
                property: { connect: { id: propertyId } },
                tenant: { connect: { id: tenantId } },
                landlord: { connect: { id: landlordId } },
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                rent,
                status
            }
        });
        res.status(201).json({ lease });
    } catch (err) {
        console.error('Create lease error:', err);
        res.status(500).json({ error: 'Failed to create lease.' });
    }
}

// Update lease
export async function updateLease(req, res) {
    try {
        const { id } = req.params;
        const { propertyId, tenantId, landlordId, startDate, endDate, rent, status } = req.body;
        const lease = await db.lease.update({
            where: { id },
            data: {
                ...(propertyId && { property: { connect: { id: propertyId } } }),
                ...(tenantId && { tenant: { connect: { id: tenantId } } }),
                ...(landlordId && { landlord: { connect: { id: landlordId } } }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(rent && { rent }),
                ...(status && { status })
            }
        });
        res.json({ lease });
    } catch (err) {
        console.error('Update lease error:', err);
        res.status(500).json({ error: 'Failed to update lease.' });
    }
}

// Delete lease
export async function deleteLease(req, res) {
    try {
        const { id } = req.params;
        await db.lease.delete({ where: { id } });
        res.json({ message: 'Lease deleted successfully.' });
    } catch (err) {
        console.error('Delete lease error:', err);
        res.status(500).json({ error: 'Failed to delete lease.' });
	}
}