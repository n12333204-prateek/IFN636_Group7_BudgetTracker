const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const adminExists = await User.findOne({ email: 'admin@budgettracker.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'Admin',
      email: 'admin@budgettracker.com',
      password: 'Admin1234!',
      role: 'admin'
    });

    console.log('Admin created successfully');
    console.log('Email: admin@budgettracker.com');
    console.log('Password: Admin1234!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();