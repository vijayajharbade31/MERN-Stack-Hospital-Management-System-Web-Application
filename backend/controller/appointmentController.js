import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import Appointment from "../models/appointmentSchema.js";
import User from "../models/userSchema.js";
import DoctorAvailability from "../models/doctorAvailabilitySchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, dob, gender, appointment_date, department, doctor_firstName, doctor_lastName, hasVisited } = req.body;
  if (
    !firstName || !lastName || !email || !phone || !dob || !gender || !appointment_date || !department || !doctor_firstName || !doctor_lastName
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });
  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        400
      )
    );
  }

  // Store the doctor's ID for the appointment
  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    ...(req.body.address ? { address: req.body.address } : {}),
    doctorId,
    patientId,
  });
  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Send!",
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find()
    .populate('doctorId', 'firstName lastName department')
    .populate('patientId', 'firstName lastName email');

  // Transform the data to include all necessary fields
  // Priority: Use appointment form data (patient info from form) over logged-in user data
  const transformedAppointments = appointments.map(apt => ({
    _id: apt._id,
    patientId: apt.patientId?._id,
    doctorId: apt.doctorId?._id,
    // Prioritize appointment email (from form) over patientId email (logged-in user)
    email: (apt.email && apt.email.trim()) ? apt.email : apt.patientId?.email,
    phone: apt.phone || apt.patientId?.phone,
    appointment_date: apt.appointment_date,
    department: apt.department || apt.doctorId?.department,
    status: apt.status || 'Pending',
    hasVisited: apt.hasVisited || false,
    doctorName: apt.doctorId ? 
      `${apt.doctorId.firstName} ${apt.doctorId.lastName}` : 
      (apt.doctor ? `${apt.doctor.firstName} ${apt.doctor.lastName}` : 'Unknown'),
    // Prioritize appointment patient name (from form) over patientId name (logged-in user)
    patientName: (apt.firstName && apt.lastName) ? 
      `${apt.firstName} ${apt.lastName}` :
      (apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Unknown Patient')
  }));

  res.status(200).json({
    success: true,
    appointments: transformedAppointments,
  });
});
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
      message: "Appointment Status Updated!",
    });
  }
);
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});

// Return booked slots (HH:MM) for a doctor on a given local date (YYYY-MM-DD)
export const getDoctorBookedSlots = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) {
    return next(new ErrorHandler("doctorId and date are required", 400));
  }

  // compute start and end of the provided local date in UTC by interpreting date as local
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  const appointments = await Appointment.find({
    doctorId,
    appointment_date: { $gte: start.toISOString(), $lte: end.toISOString() },
    status: { $in: ["Accepted", "Pending"] },
  }).select("appointment_date");

  const booked = appointments
    .map((a) => {
      try {
        const d = new Date(a.appointment_date);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  res.status(200).json({ success: true, bookedSlots: booked });
});

// Book a specific time slot (expects appointment_date ISO datetime string and doctorId)
export const bookSlot = catchAsyncErrors(async (req, res, next) => {
  const { doctorId } = req.body;
  const patientId = req.user._id;
  const appointmentDateIso = req.body.appointment_date; // e.g. 2025-10-25T09:30:00Z
  if (!doctorId || !appointmentDateIso) {
    return next(new ErrorHandler("doctorId and appointment_date are required", 400));
  }

  const appointmentDate = new Date(appointmentDateIso);
  if (isNaN(appointmentDate)) return next(new ErrorHandler("Invalid date", 400));

  // Check doctor's availability for that weekday and time
  const avail = await DoctorAvailability.findOne({ doctorId });
  if (!avail) return next(new ErrorHandler("Doctor availability not configured", 400));

  const weekday = appointmentDate.getDay();
  const timeStr = appointmentDate.toTimeString().slice(0,5); // HH:MM

  const slot = avail.slots.find(s => s.weekday === weekday && s.start <= timeStr && s.end > timeStr);
  if (!slot) return next(new ErrorHandler("Doctor not available at this time", 400));

  // Check existing appointments for doctor at same ISO minute
  const conflict = await Appointment.findOne({ doctorId, appointment_date: appointmentDateIso, status: { $in: ["Accepted","Pending"] } });
  if (conflict) {
    // add to waiting queue by creating appointment with status Pending and queue position
    const waiting = await Appointment.create({
      patientId,
      doctorId,
      appointment_date: appointmentDateIso,
      status: "Pending",
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      phone: req.user.phone,
    });
    return res.status(200).json({ success: true, message: "Time occupied; added to waiting queue", appointment: waiting });
  }

  // create accepted appointment
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    appointment_date: appointmentDateIso,
    status: "Accepted",
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
  });
  res.status(201).json({ success: true, appointment });
});

// Suggest next available slot for a given doctor and preferred datetime. Returns a slot ISO string.
export const suggestSlot = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, preferred } = req.query; // preferred optional ISO datetime
  if (!doctorId) return next(new ErrorHandler('doctorId required', 400));
  const avail = await DoctorAvailability.findOne({ doctorId });
  if (!avail) return res.status(200).json({ success: true, suggestions: [] });

  const startDate = preferred ? new Date(preferred) : new Date();
  // look forward N days
  const suggestions = [];
  const maxDays = 14;
  for (let d = 0; d < maxDays && suggestions.length < 6; d++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + d);
    const weekday = day.getDay();
    const daySlots = avail.slots.filter(s => s.weekday === weekday);
    for (const s of daySlots) {
      // generate times between start and end
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      const slotMinutes = s.slotMinutes || 30;
      let cursor = new Date(day);
      cursor.setHours(sh, sm, 0, 0);
      const endTime = new Date(day);
      endTime.setHours(eh, em, 0, 0);
      while (cursor < endTime && suggestions.length < 6) {
        const iso = cursor.toISOString();
        // check conflict
        const conflict = await Appointment.findOne({ doctorId, appointment_date: iso, status: { $in: ['Accepted','Pending'] } });
        if (!conflict && cursor > new Date()) suggestions.push(iso);
        cursor = new Date(cursor.getTime() + slotMinutes * 60000);
      }
    }
  }
  res.status(200).json({ success: true, suggestions });
});

// Get all appointments for the logged-in patient
export const getPatientAppointments = catchAsyncErrors(async (req, res, next) => {
  if (!req.user?._id) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // Query all appointments for this user
  const appointments = await Appointment.find({
    $or: [
      { email: req.user.email },  // Match by email
      { patientId: req.user._id }  // Or by patientId
    ]
  })
  .populate('doctorId', 'firstName lastName department')  // Get doctor details
  .sort({ appointment_date: -1 }); // Sort by date, newest first

  if (!appointments) {
    return res.status(200).json({
      success: true,
      appointments: []
    });
  }

  res.status(200).json({
    success: true,
    appointments: appointments.map(apt => ({
      _id: apt._id,
      patientName: apt.firstName && apt.lastName ? 
        `${apt.firstName} ${apt.lastName}` : 
        `${req.user.firstName} ${req.user.lastName}`,
      doctorName: apt.doctor ? 
        `${apt.doctor.firstName} ${apt.doctor.lastName}` : 
        (apt.doctorId ? `${apt.doctorId.firstName} ${apt.doctorId.lastName}` : 'Unknown Doctor'),
      date: apt.appointment_date,
      department: apt.doctorId?.department || apt.department,
      status: apt.status || 'pending',
      phone: apt.phone,
      email: apt.email
    }))
  });
});

