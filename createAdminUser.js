import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@baysawaar.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@baysawaar.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'BAY SA WAAR',
      email: 'admin@baysawaar.com',
      password: hashedPassword,
      phone: '+221784559930',
      role: 'admin',
      companyDetails: {
        name: 'BAY SA WAAR Admin',
        address: 'Dakar, Senegal',
        registrationNumber: 'ADMIN001'
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@baysawaar.com');
    console.log('Password: admin123');
    console.log('Role: admin');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();
