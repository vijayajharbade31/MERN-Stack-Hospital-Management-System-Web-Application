import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  addNewPatient,
  getAllDoctors,
  getDoctorById,
  getAllPatients,
  getPatientsWithAppointments,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
  deleteDoctor,
  deletePatient,
  updateDoctor,
  updateProfile,
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", patientRegister);
router.post("/login", login);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.post("/patient/addnew", isAdminAuthenticated, addNewPatient);
router.get("/doctors", getAllDoctors);
router.get("/doctor/:id", isAdminAuthenticated, getDoctorById);
router.put("/doctor/:id", isAdminAuthenticated, updateDoctor);
router.get("/patients", isAdminAuthenticated, getAllPatients);
router.get("/patients/appointments", isAdminAuthenticated, getPatientsWithAppointments);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.delete("/doctor/:id", isAdminAuthenticated, deleteDoctor);
router.delete("/patient/:id", isAdminAuthenticated, deletePatient);
router.put("/update", isPatientAuthenticated, updateProfile);

export default router;
