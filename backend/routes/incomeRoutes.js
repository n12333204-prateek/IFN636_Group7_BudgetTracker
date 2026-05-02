const express = require('express');
const { getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getIncome);
router.post('/', protect, createIncome);
router.put('/:id', protect, updateIncome);
router.delete('/:id', protect, deleteIncome);

module.exports = router;