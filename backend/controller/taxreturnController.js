import db from '../lib/db.js';

// Create tax return
const createTaxReturn = async (req, res) => {
  try {
    const { landlordId, year, quarter, filingType } = req.body;

    if (!landlordId || !year || !filingType) {
      return res.status(400).json({
        success: false,
        message: 'Landlord ID, year, and filing type are required'
      });
    }

    // Calculate date range
    let startDate, endDate;
    if (filingType === 'quarterly' && quarter) {
      const quarterStart = (parseInt(quarter) - 1) * 3;
      startDate = new Date(year, quarterStart, 1);
      endDate = new Date(year, quarterStart + 3, 0);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    // Get rental income
    const payments = await db.payment.findMany({
      where: {
        lease: { landlordId },
        status: 'paid',
        paidDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTaxWithheld = payments.reduce((sum, p) => sum + (p.withholdingTax || 0), 0);

    // Get deductible expenses
    const expenses = await db.expense.findMany({
      where: {
        landlordId,
        deductible: true,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const taxableIncome = totalIncome - totalExpenses;
    const taxDue = taxableIncome * 0.10; // 10% withholding tax

    // Check if tax return already exists
    const existing = await db.taxReturn.findFirst({
      where: {
        landlordId,
        year: parseInt(year),
        quarter: quarter ? parseInt(quarter) : null,
        filingType
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tax return already exists for this period'
      });
    }

    const taxReturn = await db.taxReturn.create({
      data: {
        landlordId,
        year: parseInt(year),
        quarter: quarter ? parseInt(quarter) : null,
        filingType,
        totalIncome,
        totalExpenses,
        taxableIncome,
        taxDue,
        taxPaid: totalTaxWithheld,
        status: 'draft',
        returnDataJson: {
          payments: payments.length,
          expenses: expenses.length,
          period: { startDate, endDate }
        }
      },
      include: {
        landlord: {
          include: { user: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Tax return created successfully',
      data: taxReturn
    });

  } catch (error) {
    console.error('Create tax return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tax return',
      error: error.message
    });
  }
};

// Get tax return by ID
const getTaxReturnById = async (req, res) => {
  try {
    const { taxReturnId } = req.params;

    const taxReturn = await db.taxReturn.findUnique({
      where: { id: taxReturnId },
      include: {
        landlord: {
          include: { user: true }
        }
      }
    });

    if (!taxReturn) {
      return res.status(404).json({
        success: false,
        message: 'Tax return not found'
      });
    }

    res.json({
      success: true,
      data: taxReturn
    });

  } catch (error) {
    console.error('Get tax return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax return',
      error: error.message
    });
  }
};

// Get landlord tax returns
const getLandlordTaxReturns = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { year, status } = req.query;

    const where = { landlordId };

    if (year) {
      where.year = parseInt(year);
    }

    if (status) {
      where.status = status;
    }

    const taxReturns = await db.taxReturn.findMany({
      where,
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' }
      ]
    });

    res.json({
      success: true,
      count: taxReturns.length,
      data: taxReturns
    });

  } catch (error) {
    console.error('Get landlord tax returns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax returns',
      error: error.message
    });
  }
};

// Submit tax return to KRA
const submitTaxReturn = async (req, res) => {
  try {
    const { taxReturnId } = req.params;
    const { kraPin, submissionReference } = req.body;

    const taxReturn = await db.taxReturn.findUnique({
      where: { id: taxReturnId }
    });

    if (!taxReturn) {
      return res.status(404).json({
        success: false,
        message: 'Tax return not found'
      });
    }

    if (taxReturn.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Tax return already submitted'
      });
    }

    // Update tax return
    const updated = await db.taxReturn.update({
      where: { id: taxReturnId },
      data: {
        status: 'submitted',
        filedDate: new Date(),
        kraPin,
        kraReceiptNo: submissionReference
      }
    });

    // Create notification
    const landlord = await db.landlord.findUnique({
      where: { id: taxReturn.landlordId },
      include: { user: true }
    });

    await db.notification.create({
      data: {
        userId: landlord.userId,
        landlordId: landlord.id,
        type: 'tax_filed',
        title: 'Tax Return Submitted',
        message: `Your ${taxReturn.filingType} tax return for ${taxReturn.year}${taxReturn.quarter ? ` Q${taxReturn.quarter}` : ''} has been submitted to KRA`,
        metadata: {
          taxReturnId: taxReturn.id,
          kraReceiptNo: submissionReference
        }
      }
    });

    res.json({
      success: true,
      message: 'Tax return submitted successfully',
      data: updated
    });

  } catch (error) {
    console.error('Submit tax return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit tax return',
      error: error.message
    });
  }
};

// Update tax return
const updateTaxReturn = async (req, res) => {
  try {
    const { taxReturnId } = req.params;
    const { status, notes } = req.body;

    const taxReturn = await db.taxReturn.update({
      where: { id: taxReturnId },
      data: {
        status,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Tax return updated successfully',
      data: taxReturn
    });

  } catch (error) {
    console.error('Update tax return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tax return',
      error: error.message
    });
  }
};

// Delete tax return
const deleteTaxReturn = async (req, res) => {
  try {
    const { taxReturnId } = req.params;

    const taxReturn = await db.taxReturn.findUnique({
      where: { id: taxReturnId }
    });

    if (taxReturn.status === 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete submitted tax return'
      });
    }

    await db.taxReturn.delete({
      where: { id: taxReturnId }
    });

    res.json({
      success: true,
      message: 'Tax return deleted successfully'
    });

  } catch (error) {
    console.error('Delete tax return error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tax return',
      error: error.message
    });
  }
};

// Get tax summary
const getTaxSummary = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { year } = req.query;

    const currentYear = year || new Date().getFullYear();

    const taxReturns = await db.taxReturn.findMany({
      where: {
        landlordId,
        year: parseInt(currentYear)
      }
    });

    const summary = {
      year: currentYear,
      totalIncome: taxReturns.reduce((sum, t) => sum + t.totalIncome, 0),
      totalExpenses: taxReturns.reduce((sum, t) => sum + t.totalExpenses, 0),
      totalTaxableIncome: taxReturns.reduce((sum, t) => sum + t.taxableIncome, 0),
      totalTaxDue: taxReturns.reduce((sum, t) => sum + t.taxDue, 0),
      totalTaxPaid: taxReturns.reduce((sum, t) => sum + t.taxPaid, 0),
      returns: {
        total: taxReturns.length,
        submitted: taxReturns.filter(t => t.status === 'submitted').length,
        draft: taxReturns.filter(t => t.status === 'draft').length
      }
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Get tax summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get tax summary',
      error: error.message
    });
  }
};

export {
  createTaxReturn,
  getTaxReturnById,
  getLandlordTaxReturns,
  submitTaxReturn,
  updateTaxReturn,
  deleteTaxReturn,
  getTaxSummary
};