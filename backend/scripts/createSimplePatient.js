import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';

config({ path: './config.env' });

const createSimplePatient = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Delete existing test patient
    await User.deleteOne({ email: 'patient@test.com' });
    console.log('Deleted existing test patient');

    // Create a new simple test patient
    const patientData = {
      firstName: 'Test',
      lastName: 'Patient',
      email: 'test@patient.com',
      password: 'password123',
      role: 'Patient',
      phone: '1234567890',
      gender: 'Male',
      dob: new Date('1990-01-01')
    };

    const patient = await User.create(patientData);
    console.log('✅ Simple test patient created successfully!');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${patient.email}`);
    console.log(`   Password: password123`);
    console.log('\n🔐 You can now log into the frontend with these credentials.');

  } catch (error) {
    console.error('❌ Error creating simple test patient:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

createSimplePatient();
