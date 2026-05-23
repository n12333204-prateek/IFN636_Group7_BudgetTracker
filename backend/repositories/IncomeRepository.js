// Pattern 3: Repository - abstracts Income data access from controllers
const Income = require('../models/Income');

class IncomeRepository {
  findAllByUser(userId) {
    return Income.find({ userId }).sort({ date: -1 });
  }

  create(data) {
    return Income.create(data);
  }

  findById(id) {
    return Income.findById(id);
  }

  save(income) {
    return income.save();
  }

  delete(income) {
    return income.deleteOne();
  }
}

module.exports = new IncomeRepository();
