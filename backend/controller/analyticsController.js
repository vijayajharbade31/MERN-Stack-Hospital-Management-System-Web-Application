import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { PatientRecord } from "../models/patientRecordSchema.js";
import Appointment from "../models/appointmentSchema.js";

// Summarize patient history
export const summarizePatientHistory = catchAsyncErrors(async (req, res, next) => {
  const { patientId } = req.params;

  if (!patientId) {
    return next(new ErrorHandler("Patient ID is required!", 400));
  }

  // Fetch patient records
  const patientRecord = await PatientRecord.findOne({ patientId });

  if (!patientRecord) {
    return res.status(200).json({
      success: true,
      data: {
        totalVisits: 0,
        firstVisit: null,
        lastVisit: null,
        chronicConditions: [],
        allergies: [],
        recentDiagnoses: [],
        medications: [],
        message: "No medical history available for this patient."
      }
    });
  }

  const { visits, demographic } = patientRecord;

  // Extract summary data
  const summary = {
    totalVisits: visits.length,
    firstVisit: visits.length > 0 ? visits[0].date : null,
    lastVisit: visits.length > 0 ? visits[visits.length - 1].date : null,
    chronicConditions: demographic?.chronicConditions || [],
    allergies: demographic?.allergies || [],
    recentDiagnoses: visits.slice(-3).map(v => v.diagnoses).flat().filter(d => d),
    medications: visits.slice(-3).map(v => v.prescriptions).flat(),
    height: demographic?.height || 'Not recorded',
    weight: demographic?.weight || 'Not recorded',
    bloodGroup: demographic?.bloodGroup || 'Not recorded'
  };

  res.status(200).json({
    success: true,
    data: summary
  });
});

// Get smart appointment slot suggestions
export const getSmartSlotSuggestions = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return next(new ErrorHandler("Doctor ID and date are required!", 400));
  }

  // Define working hours (9 AM to 5 PM, hourly slots)
  const allSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Fetch existing appointments for the doctor on that date
  const existingAppointments = await Appointment.find({
    doctorId,
    appointment_date: date,
    status: { $ne: 'Cancelled' }
  });

  const bookedSlots = existingAppointments
    .map(apt => {
      // Extract time from appointment_date if it contains time
      // Or return empty string if no time info
      return '';
    })
    .filter(slot => slot);

  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  // Prioritize slots (morning slots are preferred)
  const prioritizedSlots = availableSlots.map(slot => {
    const hour = parseInt(slot.split(':')[0]);
    let priority = 3; // Default priority

    // Morning slots (9-11 AM) get highest priority
    if (hour >= 9 && hour <= 11) {
      priority = 1;
    }
    // Afternoon slots (12-2 PM) get medium priority
    else if (hour >= 12 && hour <= 14) {
      priority = 2;
    }

    return {
      time: slot,
      priority: priority,
      available: true
    };
  });

  // Sort by priority
  prioritizedSlots.sort((a, b) => a.priority - b.priority);

  res.status(200).json({
    success: true,
    data: {
      suggestions: prioritizedSlots,
      totalAvailable: prioritizedSlots.length,
      date: date,
      recommendedTimes: prioritizedSlots.filter(s => s.priority === 1).map(s => s.time)
    }
  });
});

