const express = require('express');
const {
  getGoals, createGoal, updateGoal, deleteGoal, addContribution
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);
router.put('/:id/contribute', protect, addContribution);

module.exports = router;