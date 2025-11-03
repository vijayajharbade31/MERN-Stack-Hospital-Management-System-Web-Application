import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../models/userSchema.js';
import Appointment from '../models/appointmentSchema.js';

config({ path: './config.env' });

const createAppointmentsForNewPatient = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Find the new test patient
    const patient = await User.findOne({ email: 'test@patient.com' });
    if (!patient) {
      console.log('❌ Test patient not found. Please run createSimplePatient.js first.');
      return;
    }

    // Find a doctor (use the first available doctor)
    const doctor = await User.findOne({ role: 'Doctor' });
    if (!doctor) {
      console.log('❌ No doctors found. Please add a doctor first.');
      return;
    }

    // Check if appointments already exist for this patient
    const existingAppointments = await Appointment.find({ email: patient.email });
    if (existingAppointments.length > 0) {
      console.log(`✅ Appointments already exist for ${patient.firstName} ${patient.lastName} (${existingAppointments.length} appointments)`);
      return;
    }

    // Create sample appointments for the new patient
    const sampleAppointments = [
      {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        gender: patient.gender,
        address: '123 Test Street, Test City',
        patientId: patient._id,
        appointment_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        doctorId: doctor._id,
        department: doctor.doctorDepartment || 'General Medicine',
        doctor: {
          firstName: doctor.firstName,
          lastName: doctor.lastName
        },
        status: 'Pending',
        symptoms: 'Regular health checkup',
        notes: 'Annual physical examination'
      },
      {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        gender: patient.gender,
        address: '123 Test Street, Test City',
        patientId: patient._id,
        appointment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        doctorId: doctor._id,
        department: doctor.doctorDepartment || 'General Medicine',
        doctor: {
          firstName: doctor.firstName,
          lastName: doctor.lastName
        },
        status: 'Accepted',
        symptoms: 'Follow-up consultation',
        notes: 'Post-treatment follow-up visit'
      },
      {
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dob: patient.dob,
        gender: patient.gender,
        address: '123 Test Street, Test City',
        patientId: patient._id,
        appointment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        doctorId: doctor._id,
        department: doctor.doctorDepartment || 'General Medicine',
        doctor: {
          firstName: doctor.firstName,
          lastName: doctor.lastName
        },
        status: 'Completed',
        symptoms: 'Initial consultation',
        notes: 'First visit for new patient'
      }
    ];

    const appointments = await Appointment.insertMany(sampleAppointments);
    console.log(`✅ Created ${appointments.length} sample appointments for ${patient.firstName} ${patient.lastName}`);
    
    console.log('\n📅 Sample appointments created:');
    appointments.forEach((apt, index) => {
      const date = new Date(apt.appointment_date);
      console.log(`${index + 1}. ${apt.status} - ${date.toLocaleDateString()} - ${apt.symptoms}`);
    });

    console.log('\n🎉 You can now test the Record tab!');
    console.log('1. Go to the frontend login page');
    console.log('2. Login with: test@patient.com / password123');
    console.log('3. Navigate to the Record tab to see the appointments');

  } catch (error) {
    console.error('❌ Error creating appointments for new patient:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

createAppointmentsForNewPatient();
