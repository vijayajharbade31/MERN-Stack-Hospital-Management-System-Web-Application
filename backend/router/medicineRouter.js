import express from "express";
import { 
  createMedicine, 
  getAllMedicines, 
  getMedicineById, 
  updateMedicine, 
  deleteMedicine,
  addStock,
  reduceStock,
  adjustStock,
  recordSale,
  getSalesHistory,
  getExpiryAlerts,
  getLowStockAlerts,
  getStockAnalytics,
  getStockMovements,
  getBatchDetails,
  expireBatch
} from "../controller/medicineController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// ==================== MEDICINE CRUD ROUTES ====================
router.route("/")
  .post(isAdminAuthenticated, createMedicine)
  .get(isAdminAuthenticated, getAllMedicines);

router.route("/analytics")
  .get(isAdminAuthenticated, getStockAnalytics);

router.route("/alerts/expiry")
  .get(isAdminAuthenticated, getExpiryAlerts);

router.route("/alerts/low-stock")
  .get(isAdminAuthenticated, getLowStockAlerts);

router.route("/sales")
  .post(isAdminAuthenticated, recordSale)
  .get(isAdminAuthenticated, getSalesHistory);

router.route("/movements")
  .get(isAdminAuthenticated, getStockMovements);

router.route("/:id")
  .get(isAdminAuthenticated, getMedicineById)
  .put(isAdminAuthenticated, updateMedicine)
  .delete(isAdminAuthenticated, deleteMedicine);

router.route("/:id/stock/add")
  .post(isAdminAuthenticated, addStock);

router.route("/:id/stock/reduce")
  .post(isAdminAuthenticated, reduceStock);

router.route("/:id/stock/adjust")
  .post(isAdminAuthenticated, adjustStock);

router.route("/:id/batches")
  .get(isAdminAuthenticated, getBatchDetails);

router.route("/:id/batches/expire")
  .post(isAdminAuthenticated, expireBatch);

export default router;
