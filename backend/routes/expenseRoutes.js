const express = require('express');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validateEntry');
const router = express.Router();

// Chain: loggerMiddleware -> protect -> validateExpense -> controller
router.get('/', protect, getExpenses);
router.post('/', protect, validateExpense, createExpense);
router.put('/:id', protect, validateExpense, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
