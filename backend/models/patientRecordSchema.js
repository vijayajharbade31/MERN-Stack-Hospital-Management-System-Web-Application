import mongoose from "mongoose";

const visitSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  reason: String,
  notes: String,
  diagnoses: [String],
  prescriptions: [
    {
      medicineId: { type: mongoose.Schema.ObjectId, ref: "Medicine" },
      name: String,
      dose: String,
      duration: String,
    },
  ],
  doctorId: { type: mongoose.Schema.ObjectId, ref: "User" },
});

const patientRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  demographic: {
    height: String,
    weight: String,
    bloodGroup: String,
    allergies: [String],
    chronicConditions: [String],
  },
  visits: [visitSchema],
  createdAt: { type: Date, default: Date.now },
});

export const PatientRecord = mongoose.model("PatientRecord", patientRecordSchema);
