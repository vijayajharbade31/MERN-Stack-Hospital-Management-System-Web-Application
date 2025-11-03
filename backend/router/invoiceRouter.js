import express from "express";
import { 
  createInvoice, 
  getInvoice, 
  markPaid, 
  getAllInvoices,
  getPatientInvoices,
  getInvoicesByPatientId
} from "../controller/invoiceController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/").post(isAdminAuthenticated, createInvoice);
router.route("/all").get(isAdminAuthenticated, getAllInvoices);
router.route("/patient").get(isPatientAuthenticated, getPatientInvoices);
router.route("/patient/:patientId").get(isAdminAuthenticated, getInvoicesByPatientId);
router.route("/:id").get(getInvoice).patch(isAdminAuthenticated, markPaid);

export default router;
