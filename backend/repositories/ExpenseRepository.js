// Pattern 3: Repository - extends BaseRepository (OOP inheritance)
const BaseRepository = require('./BaseRepository');
const Expense = require('../models/Expense');

class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  findAllByUser(userId) {
    return this.model.find({ userId }).sort({ date: -1 });
  }

  create(data) {
    return this.model.create(data);
  }
}

module.exports = new ExpenseRepository();
