import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'ndiagalo259@gmail.com' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      firstName: 'Partner',
      lastName: 'One',
      email: 'ndiagalo259@gmail.com',
      password: hashedPassword,
      phone: '+221784559930',
      role: 'partner',
      companyDetails: {
        name: 'Partner One Company',
        address: 'Partner One Address',
        registrationNumber: 'PARTNER123'
      }
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: partner@baysawaar.com');
    console.log('Password: test123');
    console.log('Role: partner');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestUser();
