import { PatientRecord } from "../models/patientRecordSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

export const createOrUpdateRecord = catchAsyncErrors(async (req, res, next) => {
  const { patientId, demographic } = req.body;
  let record = await PatientRecord.findOne({ patientId });
  if (!record) {
    record = await PatientRecord.create({ patientId, demographic });
  } else {
    record.demographic = { ...(record.demographic || {}), ...(demographic || {}) };
    await record.save();
  }
  res.status(200).json({ success: true, record });
});

export const addVisit = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;
  const visit = req.body;
  const record = await PatientRecord.findOne({ patientId });
  if (!record) return res.status(404).json({ success: false, message: "Record not found" });
  record.visits.unshift(visit);
  await record.save();
  res.status(200).json({ success: true, visit: record.visits[0] });
});

export const getRecord = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;
  const record = await PatientRecord.findOne({ patientId }).populate("visits.doctorId", "firstName lastName role");
  if (!record) return res.status(404).json({ success: false, message: "Record not found" });
  res.status(200).json({ success: true, record });
});
