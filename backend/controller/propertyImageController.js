import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all property images
export async function getAllPropertyImages(req, res) {
	try {
		const images = await prisma.propertyImage.findMany({
			include: { property: true }
		});
		res.json({ images });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch property images.' });
	}
}

// Get single property image by ID
export async function getPropertyImageById(req, res) {
	try {
		const { id } = req.params;
		const image = await prisma.propertyImage.findUnique({
			where: { id },
			include: { property: true }
		});
		if (!image) return res.status(404).json({ error: 'Property image not found.' });
		res.json({ image });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch property image.' });
	}
}

// Create property image
export async function createPropertyImage(req, res) {
	try {
		const { propertyId, url, alt, position } = req.body;
		const image = await prisma.propertyImage.create({
			data: { propertyId, url, alt, position }
		});
		res.status(201).json({ image });
	} catch (err) {
		res.status(500).json({ error: 'Failed to create property image.' });
	}
}

// Update property image
export async function updatePropertyImage(req, res) {
	try {
		const { id } = req.params;
		const updateData = req.body;
		const image = await prisma.propertyImage.update({
			where: { id },
			data: updateData
		});
		res.json({ image });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update property image.' });
	}
}

// Delete property image
export async function deletePropertyImage(req, res) {
	try {
		const { id } = req.params;
		await prisma.propertyImage.delete({ where: { id } });
		res.json({ message: 'Property image deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete property image.' });
	}
}
