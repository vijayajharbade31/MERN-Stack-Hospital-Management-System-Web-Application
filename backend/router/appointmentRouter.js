import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  postAppointment,
  updateAppointmentStatus,
  bookSlot,
  suggestSlot,
  getPatientAppointments,
  getDoctorBookedSlots,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.get("/patient/appointments", isPatientAuthenticated, getPatientAppointments);
router.post("/book", isPatientAuthenticated, bookSlot);
router.get('/suggest', suggestSlot);
// Public endpoint to know booked slots for a doctor on a given date
router.get('/doctor/booked', getDoctorBookedSlots);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
