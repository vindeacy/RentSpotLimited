import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all properties
export async function getAllProperties(req, res) {
	try {
		const properties = await prisma.property.findMany({
			include: { landlord: true, images: true, applications: true, leases: true, messages: true }
		});
		res.json({ properties });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch properties.' });
	}
}

// Get single property by ID
export async function getPropertyById(req, res) {
	try {
		const { id } = req.params;
		const property = await prisma.property.findUnique({
			where: { id },
			include: { landlord: true, images: true, applications: true, leases: true, messages: true }
		});
		if (!property) return res.status(404).json({ error: 'Property not found.' });
		res.json({ property });
	} catch (err) {
		res.status(500).json({ error: 'Failed to fetch property.' });
	}
}

// Create property
export async function createProperty(req, res) {
  try {
    const {
      landlordId,
      title,
      slug,
      description,
      addressLine,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      price,
      currency,
      deposit,
      availableFrom,
      propertyType,
      bedrooms,
      bathrooms,
      size,
      amenities,
      status,
      seoTitle,
      seoDescription
    } = req.body;

    // amenities should be an array, ensure conversion if sent as comma-separated string
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
        ? amenities.split(',').map(a => a.trim())
        : [];

    const property = await prisma.property.create({
      data: {
        title,
        slug,
        description,
        addressLine,
        city,
        state,
        postalCode,
        country,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        price: price ? parseFloat(price) : undefined,
        currency,
        deposit: deposit ? parseFloat(deposit) : undefined,
        availableFrom: availableFrom ? new Date(availableFrom) : undefined,
        propertyType,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        size: size ? parseInt(size) : undefined,
        amenities: amenitiesArray,
        status,
        seoTitle,
        seoDescription,
		landlord: {
			connect: { id: landlordId }
		}
      }
    });

    res.status(201).json({ property });
  } catch (err) {
    console.error('Create property error:', err);
    res.status(500).json({ error: 'Failed to create property.' });
  }
}

// Update property
export async function updateProperty(req, res) {
	try {
		const { id } = req.params;
		const updateData = req.body;
		const property = await prisma.property.update({
			where: { id },
			data: updateData
		});
		res.json({ property });
	} catch (err) {
		res.status(500).json({ error: 'Failed to update property.' });
	}
}

// Delete property
export async function deleteProperty(req, res) {
	try {
		const { id } = req.params;
		await prisma.property.delete({ where: { id } });
		res.json({ message: 'Property deleted successfully.' });
	} catch (err) {
		res.status(500).json({ error: 'Failed to delete property.' });
	}
}
