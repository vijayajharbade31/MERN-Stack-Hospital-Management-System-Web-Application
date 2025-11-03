#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';

// Load environment variables
config({ path: './config.env' });

const createDoctor = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Check if doctor already exists
    const existingDoctor = await User.findOne({ email: 'doctor@hospital.com' });
    if (existingDoctor) {
      console.log('✅ Doctor already exists:', existingDoctor.firstName, existingDoctor.lastName);
      return;
    }

    // Create a doctor
    const doctor = await User.create({
      firstName: 'Dr. John',
      lastName: 'Smith',
      email: 'doctor@hospital.com',
      phone: '9876543210',
      dob: new Date('1980-05-15'),
      gender: 'Male',
      password: 'doctor12345',
      role: 'Doctor',
      doctorDepartment: 'Cardiology'
    });

    console.log('✅ Doctor created successfully!');
    console.log('📧 Login credentials:');
    console.log('   Email: doctor@hospital.com');
    console.log('   Password: doctor12345');
    console.log('   Department: Cardiology');

  } catch (error) {
    console.error('❌ Error creating doctor:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createDoctor();
