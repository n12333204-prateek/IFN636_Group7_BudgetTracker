const express = require('express');
const { getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const { validateIncome } = require('../middleware/validateEntry');
const router = express.Router();

// Chain: loggerMiddleware -> protect -> validateIncome -> controller
router.get('/', protect, getIncome);
router.post('/', protect, validateIncome, createIncome);
router.put('/:id', protect, validateIncome, updateIncome);
router.delete('/:id', protect, deleteIncome);

module.exports = router;
