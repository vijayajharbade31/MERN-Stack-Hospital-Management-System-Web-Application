import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';
import Appointment from '../models/appointmentSchema.js';
import { Invoice } from '../models/invoiceSchema.js';
import { PatientRecord } from '../models/patientRecordSchema.js';
import { Message } from '../models/messageSchema.js';
import { Medicine } from '../models/medicineSchema.js';

// Load environment variables
config({ path: './config.env' });

const clearAllData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Clear all doctors (users with role "Doctor")
    const doctorsResult = await User.deleteMany({ role: 'Doctor' });
    console.log(`✅ Removed ${doctorsResult.deletedCount} doctors`);

    // Clear all patients (users with role "Patient")
    const patientsResult = await User.deleteMany({ role: 'Patient' });
    console.log(`✅ Removed ${patientsResult.deletedCount} patients`);

    // Clear all appointments
    const appointmentsResult = await Appointment.deleteMany({});
    console.log(`✅ Removed ${appointmentsResult.deletedCount} appointments`);

    // Clear all invoices
    const invoicesResult = await Invoice.deleteMany({});
    console.log(`✅ Removed ${invoicesResult.deletedCount} invoices`);

    // Clear all patient records
    const patientRecordsResult = await PatientRecord.deleteMany({});
    console.log(`✅ Removed ${patientRecordsResult.deletedCount} patient records`);

    // Clear all messages
    const messagesResult = await Message.deleteMany({});
    console.log(`✅ Removed ${messagesResult.deletedCount} messages`);

    // Clear all medicines
    const medicinesResult = await Medicine.deleteMany({});
    console.log(`✅ Removed ${medicinesResult.deletedCount} medicines`);

    console.log('\n🎉 All data cleared successfully!');
    console.log('You can now add fresh doctors and patients.');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
clearAllData();
