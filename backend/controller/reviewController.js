import db from '../lib/db.js';

// Create a review
export const createReview = async (req, res) => {
  try {
    const { tenantId, propertyId, landlordId, rating, title, comment, category, pros, cons, wouldRecommend } = req.body;

    if (!tenantId || !propertyId || !landlordId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID, Property ID, Landlord ID, rating, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if tenant has active/past lease for this property
    const lease = await db.lease.findFirst({
      where: {
        tenantId,
        propertyId,
        landlordId
      }
    });

    if (!lease) {
      return res.status(403).json({
        success: false,
        message: 'You can only review properties you have rented'
      });
    }

    // Check if review already exists
    const existingReview = await db.review.findFirst({
      where: {
        tenantId,
        propertyId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this property'
      });
    }

    const review = await db.review.create({
      data: {
        tenantId,
        propertyId,
        landlordId,
        rating,
        title,
        comment,
        category,
        pros,
        cons,
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
        isVerified: true 
      },
      include: {
        tenant: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        property: {
          select: { id: true, title: true }
        }
      }
    });

    // Update landlord rating
    const allReviews = await db.review.findMany({
      where: { landlordId }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.landlord.update({
      where: { id: landlordId },
      data: {
        rating: avgRating,
        totalRatings: allReviews.length
      }
    });

    // Create notification for landlord
    const landlord = await db.landlord.findUnique({
      where: { id: landlordId },
      include: { user: true }
    });

    await db.notification.create({
      data: {
        userId: landlord.userId,
        landlordId,
        type: 'new_review',
        title: 'New Review Received',
        message: `You received a ${rating}-star review for ${review.property.title}`,
        link: `/reviews/${review.id}`,
        metadata: {
          reviewId: review.id,
          rating,
          propertyId
        }
      }
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        tenantId,
        landlordId,
        action: 'review_submitted',
        description: `Review submitted for ${review.property.title}`,
        entityType: 'Review',
        entityId: review.id,
        metadata: {
          rating,
          propertyId
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        tenant: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        property: {
          select: { id: true, title: true, addressLine: true, city: true }
        },
        landlord: {
          include: {
            user: {
              select: { id: true, name: true, companyName: true }
            }
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

// Get property reviews
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { isPublic = true, limit = 10, offset = 0 } = req.query;

    const where = { propertyId };

    if (isPublic === 'true') {
      where.isPublic = true;
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        tenant: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await db.review.count({ where });

    // Calculate rating summary
    const allReviews = await db.review.findMany({
      where: { propertyId, isPublic: true }
    });

    const ratingSummary = {
      average: allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
        : 0,
      total: allReviews.length,
      distribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length
      },
      wouldRecommend: allReviews.filter(r => r.wouldRecommend).length
    };

    res.json({
      success: true,
      count: reviews.length,
      totalCount,
      ratingSummary,
      reviews
    });

  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property reviews',
      error: error.message
    });
  }
};

// Get landlord reviews
export const getLandlordReviews = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const reviews = await db.review.findMany({
      where: {
        landlordId,
        isPublic: true
      },
      include: {
        tenant: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        property: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await db.review.count({
      where: { landlordId, isPublic: true }
    });

    res.json({
      success: true,
      count: reviews.length,
      totalCount,
      reviews
    });

  } catch (error) {
    console.error('Get landlord reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landlord reviews',
      error: error.message
    });
  }
};

// Get tenant reviews
export const getTenantReviews = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const reviews = await db.review.findMany({
      where: { tenantId },
      include: {
        property: {
          select: { id: true, title: true, addressLine: true }
        },
        landlord: {
          include: {
            user: {
              select: { name: true, companyName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error('Get tenant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tenant reviews',
      error: error.message
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, category, pros, cons, wouldRecommend, isPublic } = req.body;

    const review = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: rating || undefined,
        title: title || undefined,
        comment: comment || undefined,
        category: category || undefined,
        pros: pros || undefined,
        cons: cons || undefined,
        wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined
      }
    });

    // Recalculate landlord rating if rating changed
    if (rating) {
      const allReviews = await db.review.findMany({
        where: { landlordId: review.landlordId }
      });

      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.landlord.update({
        where: { id: review.landlordId },
        data: {
          rating: avgRating
        }
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
};

// Add landlord response to review
export const addLandlordResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { response } = req.body;
    const { userId } = req.user;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        landlord: {
          include: { user: true }
        },
        tenant: {
          include: { user: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Verify user is the landlord
    if (review.landlord.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the landlord can respond to this review'
      });
    }

    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        response,
        responseDate: new Date()
      }
    });

    // Notify tenant
    await db.notification.create({
      data: {
        userId: review.tenant.userId,
        tenantId: review.tenantId,
        type: 'review_response',
        title: 'Landlord Responded to Your Review',
        message: `${review.landlord.user.name || review.landlord.user.companyName} responded to your review`,
        link: `/reviews/${reviewId}`,
        metadata: {
          reviewId,
          landlordId: review.landlordId
        }
      }
    });

    res.json({
      success: true,
      message: 'Response added successfully',
      data: updated
    });

  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
};

// Mark review as helpful
export const markAsHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Review marked as helpful',
      helpfulCount: review.helpfulCount
    });

  } catch (error) {
    console.error('Mark as helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.user;

    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        tenant: {
          include: { user: true }
        }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only tenant who created the review can delete it
    if (review.tenant.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await db.review.delete({
      where: { id: reviewId }
    });

    // Recalculate landlord rating
    const allReviews = await db.review.findMany({
      where: { landlordId: review.landlordId }
    });

    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await db.landlord.update({
      where: { id: review.landlordId },
      data: {
        rating: avgRating,
        totalRatings: allReviews.length
      }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

// Backward-compatible export for routes
export const respondToReview = addLandlordResponse;

// Backward-compatible export for routes
export const markHelpful = markAsHelpful;