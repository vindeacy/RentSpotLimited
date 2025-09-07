import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
