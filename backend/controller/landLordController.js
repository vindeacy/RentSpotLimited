import db from '../lib/db.js';

// Get dashboard stats for landlord
export async function getDashboardStats(req, res) {
	try {
		const landlordId = req.user.landlordId; // Assuming middleware adds this

		// Get landlord's properties count
		const totalProperties = await db.property.count({
			where: { landlordId }
		});

		// Get active tenants count
		const totalTenants = await db.lease.count({
			where: {
				landlordId,
				status: 'active'
			}
		});

		// Get pending maintenance requests
		const pendingMaintenance = await db.maintenanceRequest.count({
			where: {
				landlordId,
				status: { in: ['open', 'in_progress'] }
			}
		});

		// Calculate monthly revenue (simplified - sum of all active leases rent)
		const activeLeases = await db.lease.findMany({
			where: {
				landlordId,
				status: 'active'
			},
			select: { rent: true }
		});

		const monthlyRevenue = activeLeases.reduce((sum, lease) => sum + (lease.rent || 0), 0);

		// Calculate occupancy rate
		const totalUnits = totalProperties; // Simplified - assuming 1 unit per property
		const occupiedUnits = totalTenants;
		const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

		res.json({
			totalProperties,
			totalTenants,
			monthlyRevenue,
			pendingMaintenance,
			occupancyRate
		});
	} catch (err) {
		console.error('Dashboard stats error:', err);
		res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
	}
}

// Get all landlords
export async function getAllLandlords(req, res) {
	try {
		const landlords = await prisma.landlord.findMany({
			include: { user: true, properties: true, leases: true }
		});
		res.json({ landlords });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch landlords.' });
	}
}

// Get single landlord by ID
export async function getLandlordById(req, res) {
	try {
		const { id } = req.params;
		const landlord = await prisma.landlord.findUnique({
			where: { id },
			include: { user: true, properties: true, leases: true }
		});
		if (!landlord) return res.status(404).json({ error: 'Landlord not found.' });
		res.json({ landlord });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch landlord.' });
	}
}

// Create landlord
export async function createLandlord(req, res) {
	try {
		const { userId, companyName, verified } = req.body;
		const landlord = await prisma.landlord.create({
			data: { userId, companyName, verified }
		});
		res.status(201).json({ landlord });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create landlord.' });
	}
}

// Update landlord
// on this, we are going to use the user update method (landlord is a user)
export async function updateLandlord(req, res) {
	try {
		const { id } = req.params;
		const { companyName, verified } = req.body;
		const landlord = await prisma.landlord.update({
			where: { id },
			data: { companyName, verified }
		});
		res.json({ landlord });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update landlord.' });
	}
}

// Delete landlord
export async function deleteLandlord(req, res) {
	try {
		const { id } = req.params;
		await prisma.landlord.delete({ where: { id } });
		res.json({ message: 'Landlord deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete landlord.' });
	}
}
