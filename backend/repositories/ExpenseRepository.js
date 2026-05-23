// Pattern 3: Repository - abstracts Expense data access from controllers
const Expense = require('../models/Expense');

class ExpenseRepository {
  findAllByUser(userId) {
    return Expense.find({ userId }).sort({ date: -1 });
  }

  create(data) {
    return Expense.create(data);
  }

  findById(id) {
    return Expense.findById(id);
  }

  save(expense) {
    return expense.save();
  }

  delete(expense) {
    return expense.deleteOne();
  }
}

module.exports = new ExpenseRepository();
