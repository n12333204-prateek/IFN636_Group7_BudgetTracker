// Pattern 3: Repository - extends BaseRepository (OOP inheritance)
const BaseRepository = require('./BaseRepository');
const Budget = require('../models/Budget');

class BudgetRepository extends BaseRepository {
  constructor() {
    super(Budget);
  }

  findAllByUser(userId) {
    return this.model.find({ userId });
  }

  findByUserAndCategory(userId, category) {
    return this.model.findOne({ userId, category });
  }

  create(data) {
    return this.model.create(data);
  }
}

module.exports = new BudgetRepository();
