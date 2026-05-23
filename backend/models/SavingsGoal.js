const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalName: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);