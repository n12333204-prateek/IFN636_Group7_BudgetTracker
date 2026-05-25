// Pattern 3: Repository - controllers use repos, not models directly
// Pattern 5: Facade - budget work goes through BudgetService
const expenseRepo = require('../repositories/ExpenseRepository');
const budgetService = require('../services/BudgetService');

const getExpenses = async (req, res) => {
  try {
    const expenses = await expenseRepo.findAllByUser(req.user.id);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  const { amount, category, date, description } = req.body;
  try {
    const expense = await expenseRepo.create({
      userId: req.user.id, amount, category, date, description
    });

    // facade updates the budget and notifies the observers, then we build the alert
    const budget = await budgetService.applyExpense(req.user.id, category, amount);
    const budgetAlert = budgetService.buildAlert(budget, category);

    res.status(201).json({ ...expense.toObject(), budgetAlert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await expenseRepo.findById(req.params.id);
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

    const updated = await expenseRepo.save(expense);

    // move the spent amount from the old budget to the new one
    await budgetService.moveExpense(
      req.user.id, oldCategory, oldAmount, updated.category, updated.amount
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await expenseRepo.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await budgetService.revertExpense(req.user.id, expense.category, expense.amount);
    await expenseRepo.delete(expense);

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
