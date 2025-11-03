#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userSchema.js';
import { DoctorAvailability } from '../models/doctorAvailabilitySchema.js';
import { Medicine } from '../models/medicineSchema.js';
import Appointment from '../models/appointmentSchema.js';
import { dbConnection } from '../database/dbConnection.js';

dotenv.config({ path: './config.env' });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM_DEPLOYED' });
  console.log('Connected to DB for seeding');

  // create admin
  await User.deleteMany({});
  await DoctorAvailability.deleteMany({});
  await Medicine.deleteMany({});
  await Appointment.deleteMany({});

  const admin = await User.create({ firstName: 'Admin', lastName: 'User', email: 'admin@example.com', phone:'0123456789', dob: new Date('1980-01-01'), gender:'Male', password:'password123', role:'Admin' });
  const doctor = await User.create({ firstName: 'John', lastName: 'Doe', email: 'doc@example.com', phone:'0123456789', dob: new Date('1985-01-01'), gender:'Male', password:'password123', role:'Doctor', doctorDepartment:'Cardiology' });
  const patient = await User.create({ firstName: 'Jane', lastName: 'Patient', email: 'patient@example.com', phone:'0123456789', dob: new Date('1995-01-01'), gender:'Female', password:'password123', role:'Patient' });

  // availability: Monday (1) 09:00-12:00 slots of 30m
  await DoctorAvailability.create({ doctorId: doctor._id, slots:[{ weekday:1, start:'09:00', end:'12:00', slotMinutes:30 }] });

  // medicine
  await Medicine.create({ name:'Paracetamol', quantity:100, unitPrice:5, expiryDate: new Date(Date.now() + 1000*60*60*24*365) });

  // appointment: tomorrow at 09:30
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9,30,0,0);
  await Appointment.create({ firstName: patient.firstName, lastName: patient.lastName, email: patient.email, phone: patient.phone, dob: patient.dob, gender: patient.gender, appointment_date: tomorrow.toISOString(), department: 'Cardiology', doctor:{ firstName: doctor.firstName, lastName: doctor.lastName }, doctorId: doctor._id, patientId: patient._id, status:'Accepted', address: 'Patient Address' });

  console.log('Seed completed. Admin: admin@example.com / password123, Doctor: doc@example.com / password123, Patient: patient@example.com / password123');
  process.exit(0);
}

seed().catch(err=>{ console.error(err); process.exit(1); });
