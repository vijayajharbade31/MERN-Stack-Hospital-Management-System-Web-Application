import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';

config({ path: './config.env' });

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const patients = await User.find({ role: 'Patient' });
    const doctors = await User.find({ role: 'Doctor' });
    const admins = await User.find({ role: 'Admin' });
    
    console.log('\n📊 Current users:');
    console.log('Patients:', patients.length);
    console.log('Doctors:', doctors.length);
    console.log('Admins:', admins.length);
    
    if (patients.length > 0) {
      console.log('\n👥 Sample patients:');
      patients.slice(0, 3).forEach(p => {
        console.log(`- ${p.firstName} ${p.lastName} (${p.email})`);
      });
    }
    
    if (admins.length > 0) {
      console.log('\n👨‍💼 Sample admins:');
      admins.slice(0, 3).forEach(a => {
        console.log(`- ${a.firstName} ${a.lastName} (${a.email})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkUsers();
