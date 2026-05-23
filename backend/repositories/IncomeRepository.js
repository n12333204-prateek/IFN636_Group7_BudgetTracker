// Pattern 3: Repository - extends BaseRepository (OOP inheritance)
const BaseRepository = require('./BaseRepository');
const Income = require('../models/Income');

class IncomeRepository extends BaseRepository {
  constructor() {
    super(Income);
  }

  findAllByUser(userId) {
    return this.model.find({ userId }).sort({ date: -1 });
  }

  create(data) {
    return this.model.create(data);
  }
}

module.exports = new IncomeRepository();
