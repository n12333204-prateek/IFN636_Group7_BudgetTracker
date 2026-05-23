const Income = require('../models/Income');

const getIncome = async (req, res) => {
  try {
    // Return income sorted by newest date first
    const income = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIncome = async (req, res) => {
  const { amount, source, date, description, frequency } = req.body;
  try {
    const income = await Income.create({
      userId: req.user.id, amount, source, date, description, frequency
    });
    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const { amount, source, date, description, frequency } = req.body;
    income.amount = amount || income.amount;
    income.source = source || income.source;
    income.date = date || income.date;
    income.description = description || income.description;
    income.frequency = frequency || income.frequency;

    const updated = await income.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) return res.status(404).json({ message: 'Income not found' });
    if (income.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await income.deleteOne();
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getIncome, createIncome, updateIncome, deleteIncome };