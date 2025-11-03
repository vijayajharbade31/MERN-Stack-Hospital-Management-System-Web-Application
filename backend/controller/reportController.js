import Appointment from "../models/appointmentSchema.js";
import { Invoice } from "../models/invoiceSchema.js";
import { Medicine, SalesRecord } from "../models/medicineSchema.js";
import User from "../models/userSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

// Daily patient counts for last N days
export const dailyPatientCounts = catchAsyncErrors(async (req, res) => {
  const days = Number(req.query.days || 7);
  const results = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    
    const count = await Appointment.countDocuments({ 
      createdAt: { $gte: start, $lte: end } 
    });
    
    results.push({ 
      date: start.toISOString().slice(0, 10), 
      count,
      dayName: start.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Monthly patient counts
export const monthlyPatientCounts = catchAsyncErrors(async (req, res) => {
  const months = Number(req.query.months || 12);
  const results = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const count = await Appointment.countDocuments({ 
      createdAt: { $gte: start, $lte: end } 
    });
    
    results.push({ 
      month: `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`,
      monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count 
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Revenue trends
export const revenueTrend = catchAsyncErrors(async (req, res) => {
  const months = Number(req.query.months || 6);
  const results = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const invoices = await Invoice.find({ 
      createdAt: { $gte: start, $lte: end },
      paid: true 
    });
    
    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const invoiceCount = invoices.length;
    
    results.push({ 
      month: `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`,
      monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      total,
      invoiceCount 
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Daily revenue
export const dailyRevenue = catchAsyncErrors(async (req, res) => {
  const days = Number(req.query.days || 7);
  const results = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    
    const invoices = await Invoice.find({ 
      createdAt: { $gte: start, $lte: end },
      paid: true 
    });
    
    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const invoiceCount = invoices.length;
    
    results.push({ 
      date: start.toISOString().slice(0, 10), 
      total,
      invoiceCount,
      dayName: start.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Pharmacy data - medicine sales
export const pharmacySalesData = catchAsyncErrors(async (req, res) => {
  const days = Number(req.query.days || 30);
  const results = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    
    const salesRecords = await SalesRecord.find({ 
      saleDate: { $gte: start, $lte: end } 
    });
    
    const totalSales = salesRecords.reduce((sum, record) => sum + (record.totalAmount || 0), 0);
    const totalQuantity = salesRecords.reduce((sum, record) => sum + (record.quantitySold || 0), 0);
    const uniqueMedicines = new Set(salesRecords.map(record => record.medicineId.toString())).size;
    
    results.push({ 
      date: start.toISOString().slice(0, 10), 
      totalSales,
      totalQuantity,
      uniqueMedicines,
      dayName: start.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Top selling medicines
export const topSellingMedicines = catchAsyncErrors(async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const days = Number(req.query.days || 30);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const salesData = await SalesRecord.aggregate([
    {
      $match: {
        saleDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$medicineId",
        totalQuantity: { $sum: "$quantitySold" },
        totalRevenue: { $sum: "$totalAmount" },
        salesCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "medicines",
        localField: "_id",
        foreignField: "_id",
        as: "medicine"
      }
    },
    {
      $unwind: "$medicine"
    },
    {
      $project: {
        medicineName: "$medicine.name",
        brand: "$medicine.brand",
        category: "$medicine.category",
        totalQuantity: 1,
        totalRevenue: 1,
        salesCount: 1,
        unitPrice: { $divide: ["$totalRevenue", "$totalQuantity"] }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: limit
    }
  ]);
  
  res.status(200).json({ success: true, results: salesData });
});

// Low stock medicines
export const lowStockMedicines = catchAsyncErrors(async (req, res) => {
  const medicines = await Medicine.find({
    $or: [
      { isLowStock: true },
      { isOutOfStock: true },
      { isExpiringSoon: true }
    ]
  }).select('name brand category currentStock minimumStock isLowStock isOutOfStock isExpiringSoon batches');
  
  const results = medicines.map(medicine => ({
    _id: medicine._id,
    name: medicine.name,
    brand: medicine.brand,
    category: medicine.category,
    currentStock: medicine.currentStock,
    minimumStock: medicine.minimumStock,
    isLowStock: medicine.isLowStock,
    isOutOfStock: medicine.isOutOfStock,
    isExpiringSoon: medicine.isExpiringSoon,
    expiringBatches: medicine.batches.filter(batch => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return batch.isActive && batch.expiryDate <= thirtyDaysFromNow;
    })
  }));
  
  res.status(200).json({ success: true, results });
});

// Department-wise patient counts
export const departmentWisePatients = catchAsyncErrors(async (req, res) => {
  const months = Number(req.query.months || 6);
  const results = [];
  const now = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const departmentData = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    results.push({
      month: `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`,
      monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      departments: departmentData
    });
  }
  
  res.status(200).json({ success: true, results });
});

// Overall statistics
export const overallStats = catchAsyncErrors(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // Patient counts
  const totalPatients = await User.countDocuments({ role: 'Patient' });
  const monthlyPatients = await User.countDocuments({ 
    role: 'Patient',
    createdAt: { $gte: startOfMonth }
  });
  
  // Doctor counts
  const totalDoctors = await User.countDocuments({ role: 'Doctor' });
  
  // Appointment counts
  const totalAppointments = await Appointment.countDocuments();
  const monthlyAppointments = await Appointment.countDocuments({
    createdAt: { $gte: startOfMonth }
  });
  const pendingAppointments = await Appointment.countDocuments({ status: 'Pending' });
  
  // Revenue data
  const totalRevenue = await Invoice.aggregate([
    { $match: { paid: true } },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);
  
  const monthlyRevenue = await Invoice.aggregate([
    { $match: { paid: true, createdAt: { $gte: startOfMonth } } },
    { $group: { _id: null, total: { $sum: "$total" } } }
  ]);
  
  // Medicine data
  const totalMedicines = await Medicine.countDocuments();
  const lowStockMedicines = await Medicine.countDocuments({ isLowStock: true });
  const outOfStockMedicines = await Medicine.countDocuments({ isOutOfStock: true });
  const expiringMedicines = await Medicine.countDocuments({ isExpiringSoon: true });
  
  const stats = {
    patients: {
      total: totalPatients,
      monthly: monthlyPatients
    },
    doctors: {
      total: totalDoctors
    },
    appointments: {
      total: totalAppointments,
      monthly: monthlyAppointments,
      pending: pendingAppointments
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      monthly: monthlyRevenue[0]?.total || 0
    },
    medicines: {
      total: totalMedicines,
      lowStock: lowStockMedicines,
      outOfStock: outOfStockMedicines,
      expiring: expiringMedicines
    }
  };
  
  res.status(200).json({ success: true, stats });
});

// Export data for reports
export const exportReportData = catchAsyncErrors(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  
  if (!type) {
    return res.status(400).json({ 
      success: false, 
      message: "Report type is required" 
    });
  }
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  let data = [];
  
  try {
    switch (type) {
      case 'patients':
        data = await Appointment.find({
          createdAt: { $gte: start, $lte: end }
        }).populate('patientId', 'firstName lastName email phone');
        break;
        
      case 'revenue':
        data = await Invoice.find({
          createdAt: { $gte: start, $lte: end }
        }).populate('patientId', 'firstName lastName');
        break;
        
      case 'pharmacy':
        data = await SalesRecord.find({
          saleDate: { $gte: start, $lte: end }
        }).populate('medicineId', 'name brand category');
        break;
        
      case 'overview':
        // For overview, return summary data
        const patientCount = await User.countDocuments({ role: 'Patient' });
        const doctorCount = await User.countDocuments({ role: 'Doctor' });
        const appointmentCount = await Appointment.countDocuments();
        const invoiceCount = await Invoice.countDocuments();
        const totalRevenue = await Invoice.aggregate([
          { $match: { paid: true } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        
        data = {
          patients: patientCount,
          doctors: doctorCount,
          appointments: appointmentCount,
          invoices: invoiceCount,
          revenue: totalRevenue[0]?.total || 0
        };
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: "Invalid report type. Valid types: patients, revenue, pharmacy, overview" 
        });
    }
    
    res.status(200).json({ 
      success: true, 
      data,
      exportInfo: {
        type,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        generatedAt: new Date().toISOString(),
        recordCount: Array.isArray(data) ? data.length : 'N/A'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
});
