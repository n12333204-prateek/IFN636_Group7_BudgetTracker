const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const getExpenses = async (req, res) => {
  try {
    // Return expenses sorted by newest date first
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  const { amount, category, date, description } = req.body;
  try {
    const expense = await Expense.create({
      userId: req.user.id, amount, category, date, description
    });

    let budgetAlert = null;

    // Find matching budget for this category and update spent amount
    const budget = await Budget.findOne({ userId: req.user.id, category });
    if (budget) {
      budget.spentAmount = budget.spentAmount + Number(amount);
      await budget.save();

      // Calculate what percentage of the budget has been used
      const percentage = (budget.spentAmount / budget.limitAmount) * 100;

      // Send alert if budget is exceeded or approaching limit (80%+)
      if (percentage >= 100) {
        budgetAlert = {
          type: 'exceeded',
          category,
          percentage: Math.round(percentage),
          message: `You have exceeded your ${category} budget! ($${budget.spentAmount.toFixed(2)} spent of $${budget.limitAmount.toFixed(2)} limit)`
        };
      } else if (percentage >= 80) {
        budgetAlert = {
          type: 'warning',
          category,
          percentage: Math.round(percentage),
          message: `You have used ${Math.round(percentage)}% of your ${category} budget. Only $${(budget.limitAmount - budget.spentAmount).toFixed(2)} remaining.`
        };
      }
    }

    // Spread expense fields and include budget alert info in one response
    res.status(201).json({ ...expense.toObject(), budgetAlert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const oldAmount = expense.amount;
    const oldCategory = expense.category;
    const { amount, category, date, description } = req.body;

    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description || expense.description;

    const updated = await expense.save();

    // Remove old amount from the previous category budget
    const oldBudget = await Budget.findOne({ userId: req.user.id, category: oldCategory });
    if (oldBudget) {
      oldBudget.spentAmount = Math.max(0, oldBudget.spentAmount - Number(oldAmount));
      await oldBudget.save();
    }

    // Add new amount to the updated category budget
    const newBudget = await Budget.findOne({ userId: req.user.id, category: expense.category });
    if (newBudget) {
      newBudget.spentAmount = newBudget.spentAmount + Number(expense.amount);
      await newBudget.save();
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    // Subtract this expense amount from the category budget
    const budget = await Budget.findOne({ userId: req.user.id, category: expense.category });
    if (budget) {
      budget.spentAmount = Math.max(0, budget.spentAmount - Number(expense.amount));
      await budget.save();
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };