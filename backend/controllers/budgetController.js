const Budget = require('../models/Budget');

const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBudget = async (req, res) => {
  const { category, limitAmount, timePeriod, startDate } = req.body;
  try {
    const budget = await Budget.create({
      userId: req.user.id, category, limitAmount, timePeriod, startDate
    });
    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const { category, limitAmount, spentAmount, timePeriod, startDate } = req.body;
    budget.category = category || budget.category;
    budget.limitAmount = limitAmount || budget.limitAmount;
    budget.spentAmount = spentAmount !== undefined ? spentAmount : budget.spentAmount;
    budget.timePeriod = timePeriod || budget.timePeriod;
    budget.startDate = startDate || budget.startDate;

    const updated = await budget.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await budget.deleteOne();
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBudgets, createBudget, updateBudget, deleteBudget };