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

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to database');

    // Get counts before deletion
    const doctorCount = await User.countDocuments({ role: 'Doctor' });
    const patientCount = await User.countDocuments({ role: 'Patient' });
    const appointmentCount = await Appointment.countDocuments({});
    const invoiceCount = await Invoice.countDocuments({});
    const patientRecordCount = await PatientRecord.countDocuments({});
    const messageCount = await Message.countDocuments({});
    const medicineCount = await Medicine.countDocuments({});

    console.log('\n📊 Current database counts:');
    console.log(`   Doctors: ${doctorCount}`);
    console.log(`   Patients: ${patientCount}`);
    console.log(`   Appointments: ${appointmentCount}`);
    console.log(`   Invoices: ${invoiceCount}`);
    console.log(`   Patient Records: ${patientRecordCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Medicines: ${medicineCount}`);

    if (doctorCount === 0 && patientCount === 0 && appointmentCount === 0 && 
        invoiceCount === 0 && patientRecordCount === 0 && messageCount === 0) {
      console.log('\n✅ Database is already clean! No data to remove.');
      console.log('🎉 You can start adding fresh doctors and patients.');
      return;
    }

    console.log('\n🗑️  Starting data cleanup...');

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

    // Note: Keeping medicines as they might be needed for reference
    console.log(`ℹ️  Medicines kept: ${medicineCount} (not removed)`);

    console.log('\n🎉 Database reset completed successfully!');
    console.log('✨ You can now add fresh doctors and patients.');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to the dashboard');
    console.log('   2. Navigate to "Add New Doctor" to add doctors');
    console.log('   3. Navigate to "Add New Admin" if needed');
    console.log('   4. Patients can register through the frontend');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
resetDatabase();
