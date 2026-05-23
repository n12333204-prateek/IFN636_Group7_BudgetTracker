const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  date: { type: Date, required: true },
  // Income recurrence
  frequency: {
    type: String,
    enum: ['One-time', 'Weekly', 'Fortnightly', 'Monthly'],
    default: 'One-time'
  },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);