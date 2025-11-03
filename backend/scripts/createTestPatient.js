import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';

config({ path: './config.env' });

const createTestPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Check if test patient already exists
    const existingPatient = await User.findOne({ email: 'patient@test.com' });
    if (existingPatient) {
      console.log('✅ Test patient already exists:');
      console.log(`   Name: ${existingPatient.firstName} ${existingPatient.lastName}`);
      console.log(`   Email: ${existingPatient.email}`);
      console.log(`   Password: test123`);
      return;
    }

    // Create a new test patient
    const patientData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@test.com',
      password: 'test12345',
      role: 'Patient',
      phone: '1234567890',
      gender: 'Male',
      dob: new Date('1990-01-01'),
      address: '123 Test Street, Test City'
    };

    const patient = await User.create(patientData);
    console.log('✅ Test patient created successfully!');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${patient.email}`);
    console.log(`   Password: test12345`);
    console.log('\n🔐 You can now log into the frontend with these credentials.');
    console.log('📝 Go to the frontend login page and use these credentials to test the Record tab.');

  } catch (error) {
    console.error('❌ Error creating test patient:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

createTestPatient();
