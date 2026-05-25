// Pattern 3: Repository - base class with shared CRUD methods
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  findById(id) {
    return this.model.findById(id);
  }

  save(doc) {
    return doc.save();
  }

  delete(doc) {
    return doc.deleteOne();
  }
}

module.exports = BaseRepository;
