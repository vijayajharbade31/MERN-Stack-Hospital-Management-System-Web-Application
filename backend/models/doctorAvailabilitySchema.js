import mongoose from "mongoose";

// Simple availability model: doctor, weekday (0-6), start/end times in HH:MM, slot duration in minutes
const slotSchema = new mongoose.Schema({
  weekday: { type: Number, min: 0, max: 6 },
  start: String, // "09:00"
  end: String, // "17:00"
  slotMinutes: { type: Number, default: 30 },
});

const doctorAvailabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  slots: [slotSchema],
});

const DoctorAvailability = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
export default DoctorAvailability;
