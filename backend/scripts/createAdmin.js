import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';

// Load environment variables
config({ path: './config.env' });

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      return;
    }

    // Create a new admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@hospital.com',
      password: 'admin123', // This will be hashed automatically
      role: 'Admin',
      phone: '1234567890',
      gender: 'Male',
      dob: new Date('1990-01-01'),
      address: 'Hospital Admin Office'
    };

    const admin = await User.create(adminData);
    console.log('✅ Admin user created successfully!');
    console.log('📧 Login credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123`);
    console.log('\n🔐 You can now log into the dashboard with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createAdminUser();
