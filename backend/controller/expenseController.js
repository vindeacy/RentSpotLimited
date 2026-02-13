import db from '../lib/db.js';

// Create expense
const createExpense = async (req, res) => {
  try {
    const { landlordId, propertyId, category, amount, description, date, deductible, receiptUrl, vendor } = req.body;

    if (!landlordId || !category || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Landlord ID, category, amount, and date are required'
      });
    }

    const expense = await db.expense.create({
      data: {
        landlordId,
        propertyId: propertyId || null,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        deductible: deductible !== undefined ? deductible : true,
        receiptUrl,
        vendor
      },
      include: {
        property: {
          select: { id: true, title: true }
        },
        landlord: {
          include: { user: true }
        }
      }
    });

    // Create activity log
    await db.activityLog.create({
      data: {
        landlordId,
        action: 'expense_added',
        description: `Expense of KSh ${amount} added for ${category}`,
        entityType: 'Expense',
        entityId: expense.id,
        metadata: {
          category,
          amount,
          propertyId
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });

  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await db.expense.findUnique({
      where: { id: expenseId },
      include: {
        property: {
          select: { id: true, title: true, addressLine: true }
        },
        landlord: {
          include: { user: { select: { name: true, email: true } } }
        }
      }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense',
      error: error.message
    });
  }
};

// Get landlord expenses
const getLandlordExpenses = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { category, propertyId, deductible, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const where = { landlordId };

    if (category) {
      where.category = category;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (deductible !== undefined) {
      where.deductible = deductible === 'true';
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await db.expense.findMany({
      where,
      include: {
        property: {
          select: { id: true, title: true }
        }
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await db.expense.count({ where });

    const summary = {
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      deductible: expenses.filter(e => e.deductible).reduce((sum, e) => sum + e.amount, 0),
      nonDeductible: expenses.filter(e => !e.deductible).reduce((sum, e) => sum + e.amount, 0),
      byCategory: {}
    };

    // Group by category
    expenses.forEach(expense => {
      if (!summary.byCategory[expense.category]) {
        summary.byCategory[expense.category] = 0;
      }
      summary.byCategory[expense.category] += expense.amount;
    });

    res.json({
      success: true,
      count: expenses.length,
      totalCount,
      summary,
      expenses
    });

  } catch (error) {
    console.error('Get landlord expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message
    });
  }
};

// Get property expenses
const getPropertyExpenses = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { category, startDate, endDate } = req.query;

    const where = { propertyId };

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      success: true,
      count: expenses.length,
      total,
      expenses
    });

  } catch (error) {
    console.error('Get property expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property expenses',
      error: error.message
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { category, amount, description, date, deductible, receiptUrl, vendor } = req.body;

    const expense = await db.expense.update({
      where: { id: expenseId },
      data: {
        category: category || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        deductible: deductible !== undefined ? deductible : undefined,
        receiptUrl: receiptUrl || undefined,
        vendor: vendor || undefined
      }
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    await db.expense.delete({
      where: { id: expenseId }
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

// Get expense categories
const getExpenseCategories = async (req, res) => {
  try {
    const categories = [
      'maintenance',
      'repairs',
      'utilities',
      'insurance',
      'property_tax',
      'management_fees',
      'legal_fees',
      'advertising',
      'cleaning',
      'landscaping',
      'security',
      'supplies',
      'professional_services',
      'other'
    ];

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense categories',
      error: error.message
    });
  }
};

// Get expense statistics
const getExpenseStatistics = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { year, month } = req.query;

    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, month ? month - 1 : 0, 1);
    const endDate = month 
      ? new Date(currentYear, month, 0)
      : new Date(currentYear, 11, 31);

    const expenses = await db.expense.findMany({
      where: {
        landlordId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const statistics = {
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      count: expenses.length,
      deductible: expenses.filter(e => e.deductible).reduce((sum, e) => sum + e.amount, 0),
      nonDeductible: expenses.filter(e => !e.deductible).reduce((sum, e) => sum + e.amount, 0),
      byCategory: {},
      byMonth: {}
    };

    // Group by category
    expenses.forEach(expense => {
      if (!statistics.byCategory[expense.category]) {
        statistics.byCategory[expense.category] = {
          total: 0,
          count: 0
        };
      }
      statistics.byCategory[expense.category].total += expense.amount;
      statistics.byCategory[expense.category].count++;
    });

    // Group by month
    expenses.forEach(expense => {
      const monthKey = expense.date.toISOString().substring(0, 7);
      if (!statistics.byMonth[monthKey]) {
        statistics.byMonth[monthKey] = {
          total: 0,
          count: 0
        };
      }
      statistics.byMonth[monthKey].total += expense.amount;
      statistics.byMonth[monthKey].count++;
    });

    res.json({
      success: true,
      period: { startDate, endDate },
      statistics
    });

  } catch (error) {
    console.error('Get expense statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense statistics',
      error: error.message
    });
  }
};

export {
  createExpense,
  getExpenseById,
  getLandlordExpenses,
  getPropertyExpenses,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseStatistics
};