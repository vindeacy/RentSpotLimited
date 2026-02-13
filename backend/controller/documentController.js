import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const { userId } = req.user;
    const { 
      landlordId, 
      tenantId, 
      propertyId, 
      leaseId, 
      title, 
      description, 
      category, 
      fileUrl, 
      fileName, 
      fileType, 
      fileSize,
      expiryDate,
      tags 
    } = req.body;

    if (!title || !category || !fileUrl || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, file URL, and file name are required'
      });
    }

    const document = await prisma.document.create({
      data: {
        landlordId: landlordId || null,
        tenantId: tenantId || null,
        propertyId: propertyId || null,
        leaseId: leaseId || null,
        title,
        description,
        category,
        fileUrl,
        fileName,
        fileType: fileType || fileName.split('.').pop(),
        fileSize: parseInt(fileSize) || 0,
        uploadedBy: userId,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        tags: tags || []
      },
      include: {
        landlord: {
          include: { user: { select: { name: true } } }
        },
        tenant: {
          include: { user: { select: { name: true } } }
        },
        property: {
          select: { title: true }
        },
        lease: {
          select: { id: true }
        }
      }
    });

    // Create activity log
    if (landlordId) {
      await prisma.activityLog.create({
        data: {
          landlordId,
          action: 'document_uploaded',
          description: `Document "${title}" uploaded`,
          entityType: 'Document',
          entityId: document.id,
          metadata: {
            category,
            fileType: document.fileType
          }
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        landlord: {
          include: { user: { select: { name: true, email: true } } }
        },
        tenant: {
          include: { user: { select: { name: true, email: true } } }
        },
        property: {
          select: { id: true, title: true }
        },
        lease: {
          select: { id: true }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
};

// Get landlord documents
export const getLandlordDocuments = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { category, propertyId, status, limit = 50, offset = 0 } = req.query;

    const where = { landlordId };

    if (category) {
      where.category = category;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true }
        },
        lease: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.document.count({ where });

    // Check for expiring documents (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringCount = await prisma.document.count({
      where: {
        landlordId,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        status: 'active'
      }
    });

    res.json({
      success: true,
      count: documents.length,
      totalCount,
      expiringCount,
      documents
    });

  } catch (error) {
    console.error('Get landlord documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Get tenant documents
export const getTenantDocuments = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { category, status } = req.query;

    const where = { tenantId };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true }
        },
        lease: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (error) {
    console.error('Get tenant documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Get property documents
export const getPropertyDocuments = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { category } = req.query;

    const where = { propertyId };

    if (category) {
      where.category = category;
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (error) {
    console.error('Get property documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Verify document
export const verifyDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { userId } = req.user;
    const { notes } = req.body;

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        isVerified: true,
        verifiedBy: userId,
        verifiedAt: new Date(),
        notes: notes || undefined
      }
    });

    // Notify document owner
    if (document.landlordId) {
      const landlord = await prisma.landlord.findUnique({
        where: { id: document.landlordId },
        include: { user: true }
      });

      await prisma.notification.create({
        data: {
          userId: landlord.userId,
          landlordId: landlord.id,
          type: 'document_verified',
          title: 'Document Verified',
          message: `Your document "${document.title}" has been verified`,
          link: `/documents/${document.id}`,
          metadata: {
            documentId: document.id
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Document verified successfully',
      data: document
    });

  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, description, category, expiryDate, tags, status } = req.body;

    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        title: title || undefined,
        description: description || undefined,
        category: category || undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        tags: tags || undefined,
        status: status || undefined
      }
    });

    res.json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Soft delete - mark as deleted
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'deleted'
      }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get expiring documents
export const getExpiringDocuments = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { days = 30 } = req.query;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const documents = await prisma.document.findMany({
      where: {
        landlordId,
        expiryDate: {
          lte: futureDate,
          gte: new Date()
        },
        status: 'active'
      },
      include: {
        property: {
          select: { title: true }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      success: true,
      count: documents.length,
      documents
    });

  } catch (error) {
    console.error('Get expiring documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring documents',
      error: error.message
    });
  }
};

// Get document categories
export const getDocumentCategories = async (req, res) => {
  try {
    const categories = [
      'lease_agreement',
      'id_document',
      'business_license',
      'insurance_policy',
      'tax_certificate',
      'bank_statement',
      'utility_bill',
      'property_deed',
      'inspection_report',
      'maintenance_receipt',
      'payment_receipt',
      'contract',
      'other'
    ];

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get document categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document categories',
      error: error.message
    });
  }
};