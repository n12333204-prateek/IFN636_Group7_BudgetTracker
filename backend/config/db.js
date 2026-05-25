// Pattern 1: Singleton - only one MongoDB connection instance exists across the app
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

class DatabaseConnection {
  constructor() {
    if (DatabaseConnection._instance) return DatabaseConnection._instance;
    this.connection = null;
    DatabaseConnection._instance = this;
  }

  async connect() {
    if (this.connection) return this.connection;
    try {
      this.connection = await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully');
      return this.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      process.exit(1);
    }
  }
}

const dbInstance = new DatabaseConnection();
module.exports = dbInstance;
