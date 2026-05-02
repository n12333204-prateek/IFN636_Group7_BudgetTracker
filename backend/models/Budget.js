const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limitAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  timePeriod: { type: String, required: true },
  startDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);