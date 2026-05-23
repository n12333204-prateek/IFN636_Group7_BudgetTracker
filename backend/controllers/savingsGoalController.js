const SavingsGoal = require('../models/SavingsGoal');

const getGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createGoal = async (req, res) => {
  const { goalName, targetAmount, targetDate, notes } = req.body;
  try {
    const goal = await SavingsGoal.create({
      userId: req.user.id, goalName, targetAmount, targetDate, notes
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const { goalName, targetAmount, targetDate, notes } = req.body;
    goal.goalName = goalName || goal.goalName;
    goal.targetAmount = targetAmount || goal.targetAmount;
    goal.targetDate = targetDate || goal.targetDate;
    goal.notes = notes !== undefined ? notes : goal.notes;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    await goal.deleteOne();
    res.json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addContribution = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid contribution amount' });
    }

    goal.savedAmount = Math.min(goal.targetAmount, goal.savedAmount + amount);
    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, addContribution };