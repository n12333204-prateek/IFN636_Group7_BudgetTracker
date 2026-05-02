const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
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

    const budget = await Budget.findOne({
      userId: req.user.id,
      category: category
    });
    if (budget) {
      budget.spentAmount = budget.spentAmount + Number(amount);
      await budget.save();
    }

    res.status(201).json(expense);
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

    const oldBudget = await Budget.findOne({
      userId: req.user.id,
      category: oldCategory
    });
    if (oldBudget) {
      oldBudget.spentAmount = Math.max(0, oldBudget.spentAmount - Number(oldAmount));
      await oldBudget.save();
    }

    const newBudget = await Budget.findOne({
      userId: req.user.id,
      category: expense.category
    });
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

    const budget = await Budget.findOne({
      userId: req.user.id,
      category: expense.category
    });
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