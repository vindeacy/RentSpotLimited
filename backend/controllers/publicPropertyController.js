import db from '../lib/db.js';

export const getPublicProperties = async (req, res) => {
  try {
    const { query, city, type, minPrice, maxPrice, featured, limit } = req.query;

    // 1. Match the status in your Prisma Model ("vacant")
    const where = {
      status: 'vacant', 
    };

    // 2. Search logic
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    // 3. Correct Field Names from your schema
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (type) where.propertyType = type; // Use propertyType, not type

    if (minPrice || maxPrice) {
      where.price = { // Use price, not rent
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      };
    }

    const properties = await db.property.findMany({
      where,
      include: { images: true },
      // limit comes from the frontend prop
      take: limit ? parseInt(limit) : (featured === 'true' ? 6 : undefined), 
      orderBy: { createdAt: 'desc' }
    });

    // 4. Return the key the frontend expects
    res.json({ properties });
  } catch (err) {
    console.error("Prisma Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPublicPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await db.property.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ property });
  } catch (err) {
    console.error("Prisma Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

export const getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const properties = await db.property.findMany({
      where: {
        status: 'vacant',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        city: true,
        propertyType: true,
      },
      take: 5,
    });

    const suggestions = properties.map(p => ({
      id: p.id,
      title: p.title,
      city: p.city,
      type: p.propertyType,
    }));

    res.json({ suggestions });
  } catch (err) {
    console.error("Prisma Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};