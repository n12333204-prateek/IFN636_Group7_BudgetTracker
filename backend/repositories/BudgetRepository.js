// Pattern 3: Repository - abstracts Budget data access from controllers
const Budget = require('../models/Budget');

class BudgetRepository {
  findAllByUser(userId) {
    return Budget.find({ userId });
  }

  findByUserAndCategory(userId, category) {
    return Budget.findOne({ userId, category });
  }

  create(data) {
    return Budget.create(data);
  }

  findById(id) {
    return Budget.findById(id);
  }

  save(budget) {
    return budget.save();
  }

  delete(budget) {
    return budget.deleteOne();
  }
}

module.exports = new BudgetRepository();
