import express from 'express';
import { 
  dailyPatientCounts, 
  monthlyPatientCounts,
  revenueTrend, 
  dailyRevenue,
  pharmacySalesData,
  topSellingMedicines,
  lowStockMedicines,
  departmentWisePatients,
  overallStats,
  exportReportData
} from '../controller/reportController.js';

const router = express.Router();

// Patient count reports
router.get('/patients/daily', dailyPatientCounts);
router.get('/patients/monthly', monthlyPatientCounts);
router.get('/patients/departments', departmentWisePatients);

// Revenue reports
router.get('/revenue/trend', revenueTrend);
router.get('/revenue/daily', dailyRevenue);

// Pharmacy reports
router.get('/pharmacy/sales', pharmacySalesData);
router.get('/pharmacy/top-selling', topSellingMedicines);
router.get('/pharmacy/low-stock', lowStockMedicines);

// Overall statistics
router.get('/stats/overall', overallStats);

// Export functionality
router.get('/export', exportReportData);

export default router;
