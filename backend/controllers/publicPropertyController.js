import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all public properties
// @route   GET /api/public/properties
// @access  Public
export const getPublicProperties = async (req, res) => {
  try {
    const {
      query,
      city,
      country,
      type,
      minPrice,
      maxPrice,
      limit,
      featured
    } = req.query;

    // Build where clause
    const where = {
      status: 'AVAILABLE',
      isActive: true,
      AND: []
    };

    // Text search in title and description
    if (query) {
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      });
    }

    // Location filters
    if (city) {
      where.AND.push({
        city: { contains: city, mode: 'insensitive' }
      });
    }

    if (country) {
      where.AND.push({
        country: { contains: country, mode: 'insensitive' }
      });
    }

    // Property type filter
    if (type) {
      where.AND.push({ type });
    }

    // Price range filters
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
      where.AND.push({ rent: priceFilter });
    }

    // Featured properties filter
    if (featured === 'true') {
      where.AND.push({ featured: true });
    }

    // Clean up empty AND array
    if (where.AND.length === 0) {
      delete where.AND;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });

    res.json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    console.error('Error fetching public properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get single public property by ID
// @route   GET /api/public/properties/:id
// @access  Public
export const getPublicPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Only show available/active properties publicly
    if (property.status !== 'AVAILABLE' || !property.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Property not available'
      });
    }

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get search suggestions
// @route   GET /api/public/properties/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.json({
        success: true,
        suggestions: {
          cities: [],
          types: []
        }
      });
    }

    // Get unique cities
    const cities = await prisma.property.findMany({
      where: {
        city: { contains: term, mode: 'insensitive' },
        status: 'AVAILABLE',
        isActive: true
      },
      select: { city: true },
      distinct: ['city'],
      take: 5
    });

    // Get unique property types
    const types = await prisma.property.findMany({
      where: {
        type: { contains: term, mode: 'insensitive' },
        status: 'AVAILABLE',
        isActive: true
      },
      select: { type: true },
      distinct: ['type'],
      take: 5
    });

    res.json({
      success: true,
      suggestions: {
        cities: cities.map(c => c.city),
        types: types.map(t => t.type)
      }
    });

  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggestions'
    });
  }
};
