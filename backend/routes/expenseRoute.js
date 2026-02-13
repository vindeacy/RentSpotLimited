import express from 'express';
import {
  createExpense,
  getExpenseById,
  getLandlordExpenses,
  getPropertyExpenses,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseStatistics
} from '../controller/expenseController.js';
import { authenticate, isLandlord } from '../middleware/auth.js';

const router = express.Router();

// Create expense
router.post('/', authenticate, isLandlord, createExpense);

// Get expense by ID
router.get('/:expenseId', authenticate, getExpenseById);

// Get landlord expenses
router.get('/landlord/:landlordId', authenticate, getLandlordExpenses);

// Get property expenses
router.get('/property/:propertyId', authenticate, getPropertyExpenses);

// Update expense
router.patch('/:expenseId', authenticate, isLandlord, updateExpense);

// Delete expense
router.delete('/:expenseId', authenticate, isLandlord, deleteExpense);

// Get expense categories
router.get('/meta/categories', getExpenseCategories);

// Get expense statistics
router.get('/landlord/:landlordId/statistics', authenticate, getExpenseStatistics);

export default router;