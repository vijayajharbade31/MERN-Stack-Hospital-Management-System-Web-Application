import mongoose from "mongoose";

const lineItemSchema = new mongoose.Schema({
  description: String,
  qty: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  medicineId: { type: mongoose.Schema.ObjectId, ref: "Medicine" },
});

const invoiceSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.ObjectId, ref: "Appointment" },
  items: [lineItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Invoice = mongoose.model("Invoice", invoiceSchema);
