import { Medicine, SalesRecord, StockMovement } from "../models/medicineSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// ==================== MEDICINE CRUD OPERATIONS ====================

export const createMedicine = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    genericName,
    brand,
    manufacturer,
    sku,
    category,
    dosageForm,
    description,
    costPrice,
    sellingPrice,
    minimumStock,
    maximumStock,
    unit,
    batchInfo
  } = req.body;

  // Check if SKU already exists
  if (sku) {
    const existingMedicine = await Medicine.findOne({ sku });
    if (existingMedicine) {
      return next(new ErrorHandler("Medicine with this SKU already exists", 400));
    }
  }

  const medicineData = {
    name,
    genericName,
    brand,
    manufacturer,
    sku,
    category,
    dosageForm,
    description,
    costPrice,
    sellingPrice,
    minimumStock,
    maximumStock,
    unit
  };

  const medicine = await Medicine.create(medicineData);

  // Add initial stock if provided
  if (batchInfo && batchInfo.quantity > 0) {
    await medicine.addStock(batchInfo.quantity, batchInfo);
  }

  res.status(201).json({
    success: true,
    message: "Medicine created successfully",
    medicine
  });
});

export const getAllMedicines = catchAsyncErrors(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  const query = {};

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const medicines = await Medicine.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('salesRecords', 'quantitySold totalAmount saleDate')
    .populate('stockMovements', 'movementType quantity movementDate');

  const total = await Medicine.countDocuments(query);

  res.status(200).json({
    success: true,
    medicines,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalMedicines: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

export const getMedicineById = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id)
    .populate('salesRecords')
    .populate('stockMovements');

  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  res.status(200).json({
    success: true,
    medicine
  });
});

export const updateMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  // Check SKU uniqueness if being updated
  if (req.body.sku && req.body.sku !== medicine.sku) {
    const existingMedicine = await Medicine.findOne({ sku: req.body.sku });
    if (existingMedicine) {
      return next(new ErrorHandler("Medicine with this SKU already exists", 400));
    }
  }

  const updatedMedicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    medicine: updatedMedicine
  });
});

export const deleteMedicine = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  // Soft delete by changing status
  medicine.status = 'discontinued';
  await medicine.save();

  res.status(200).json({
    success: true,
    message: "Medicine discontinued successfully"
  });
});

// ==================== STOCK MANAGEMENT ====================

export const addStock = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, batchInfo } = req.body;

  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  if (quantity <= 0) {
    return next(new ErrorHandler("Quantity must be positive", 400));
  }

  // Add stock
  await medicine.addStock(quantity, batchInfo);

  // Create stock movement record
  const stockMovement = await StockMovement.create({
    medicineId: id,
    movementType: 'purchase',
    quantity: quantity,
    previousStock: medicine.currentStock - quantity,
    newStock: medicine.currentStock,
    reason: batchInfo?.reason || 'Stock added',
    performedBy: req.user._id,
    batchNo: batchInfo?.batchNo,
    expiryDate: batchInfo?.expiryDate
  });

  // Update medicine with stock movement reference
  medicine.stockMovements.push(stockMovement._id);
  await medicine.save();

  res.status(200).json({
    success: true,
    message: "Stock added successfully",
    medicine,
    stockMovement
  });
});

export const reduceStock = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, reason } = req.body;

  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  if (quantity <= 0) {
    return next(new ErrorHandler("Quantity must be positive", 400));
  }

  if (medicine.currentStock < quantity) {
    return next(new ErrorHandler("Insufficient stock", 400));
  }

  const previousStock = medicine.currentStock;
  await medicine.reduceStock(quantity);

  // Create stock movement record
  const stockMovement = await StockMovement.create({
    medicineId: id,
    movementType: 'sale',
    quantity: -quantity,
    previousStock: previousStock,
    newStock: medicine.currentStock,
    reason: reason || 'Stock reduced',
    performedBy: req.user._id
  });

  // Update medicine with stock movement reference
  medicine.stockMovements.push(stockMovement._id);
  await medicine.save();

  res.status(200).json({
    success: true,
    message: "Stock reduced successfully",
    medicine,
    stockMovement
  });
});

export const adjustStock = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { newQuantity, reason } = req.body;

  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  if (newQuantity < 0) {
    return next(new ErrorHandler("Stock cannot be negative", 400));
  }

  const previousStock = medicine.currentStock;
  const adjustment = newQuantity - previousStock;
  
  medicine.currentStock = newQuantity;
  await medicine.save();

  // Create stock movement record
  const stockMovement = await StockMovement.create({
    medicineId: id,
    movementType: 'adjustment',
    quantity: adjustment,
    previousStock: previousStock,
    newStock: newQuantity,
    reason: reason || 'Stock adjustment',
    performedBy: req.user._id
  });

  // Update medicine with stock movement reference
  medicine.stockMovements.push(stockMovement._id);
  await medicine.save();

  res.status(200).json({
    success: true,
    message: "Stock adjusted successfully",
    medicine,
    stockMovement
  });
});

// ==================== SALES TRACKING ====================

export const recordSale = catchAsyncErrors(async (req, res, next) => {
  const { medicineId, quantitySold, unitPrice, soldTo, invoiceId } = req.body;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  if (medicine.currentStock < quantitySold) {
    return next(new ErrorHandler("Insufficient stock", 400));
  }

  const totalAmount = quantitySold * unitPrice;

  // Create sales record
  const salesRecord = await SalesRecord.create({
    medicineId,
    quantitySold,
    unitPrice,
    totalAmount,
    soldTo,
    soldBy: req.user._id,
    invoiceId
  });

  // Reduce stock
  await medicine.reduceStock(quantitySold);

  // Update medicine with sales record reference
  medicine.salesRecords.push(salesRecord._id);
  await medicine.save();

  res.status(201).json({
    success: true,
    message: "Sale recorded successfully",
    salesRecord,
    medicine
  });
});

export const getSalesHistory = catchAsyncErrors(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    medicineId
  } = req.query;

  const query = {};

  if (medicineId) {
    query.medicineId = medicineId;
  }

  if (startDate || endDate) {
    query.saleDate = {};
    if (startDate) query.saleDate.$gte = new Date(startDate);
    if (endDate) query.saleDate.$lte = new Date(endDate);
  }

  const sales = await SalesRecord.find(query)
    .populate('medicineId', 'name brand sku')
    .populate('soldBy', 'firstName lastName')
    .populate('invoiceId')
    .sort({ saleDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await SalesRecord.countDocuments(query);

  res.status(200).json({
    success: true,
    sales,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalSales: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// ==================== ALERTS AND ANALYTICS ====================

export const getExpiryAlerts = catchAsyncErrors(async (req, res) => {
  const { days = 30 } = req.query;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

  const medicines = await Medicine.find({
    'batches.expiryDate': { $lte: cutoffDate },
    'batches.isActive': true,
    status: 'active'
  }).populate('batches');

  const expiringMedicines = medicines.map(medicine => {
    const expiringBatches = medicine.getExpiringBatches(parseInt(days));
    return {
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        brand: medicine.brand,
        sku: medicine.sku
      },
      expiringBatches: expiringBatches.map(batch => ({
        batchNo: batch.batchNo,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,
        daysUntilExpiry: Math.ceil((batch.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      }))
    };
  });

  res.status(200).json({
    success: true,
    expiringMedicines,
    totalExpiring: expiringMedicines.length
  });
});

export const getLowStockAlerts = catchAsyncErrors(async (req, res) => {
  const medicines = await Medicine.find({
    $or: [
      { isLowStock: true },
      { isOutOfStock: true }
    ],
    status: 'active'
  });

  res.status(200).json({
    success: true,
    lowStockMedicines: medicines,
    totalLowStock: medicines.length
  });
});

export const getStockAnalytics = catchAsyncErrors(async (req, res) => {
  const totalMedicines = await Medicine.countDocuments({ status: 'active' });
  const outOfStock = await Medicine.countDocuments({ isOutOfStock: true, status: 'active' });
  const lowStock = await Medicine.countDocuments({ isLowStock: true, status: 'active' });
  const expiringSoon = await Medicine.countDocuments({ isExpiringSoon: true, status: 'active' });

  // Calculate total stock value
  const medicines = await Medicine.find({ status: 'active' });
  const totalStockValue = medicines.reduce((sum, med) => sum + (med.currentStock * med.sellingPrice), 0);

  // Top selling medicines (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const topSelling = await SalesRecord.aggregate([
    {
      $match: {
        saleDate: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$medicineId',
        totalSold: { $sum: '$quantitySold' },
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'medicines',
        localField: '_id',
        foreignField: '_id',
        as: 'medicine'
      }
    },
    {
      $unwind: '$medicine'
    },
    {
      $project: {
        medicineName: '$medicine.name',
        brand: '$medicine.brand',
        totalSold: 1,
        totalRevenue: 1
      }
    },
    {
      $sort: { totalSold: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalMedicines,
      outOfStock,
      lowStock,
      expiringSoon,
      totalStockValue,
      topSellingMedicines: topSelling
    }
  });
});

export const getStockMovements = catchAsyncErrors(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    medicineId,
    movementType,
    startDate,
    endDate
  } = req.query;

  const query = {};

  if (medicineId) {
    query.medicineId = medicineId;
  }

  if (movementType) {
    query.movementType = movementType;
  }

  if (startDate || endDate) {
    query.movementDate = {};
    if (startDate) query.movementDate.$gte = new Date(startDate);
    if (endDate) query.movementDate.$lte = new Date(endDate);
  }

  const movements = await StockMovement.find(query)
    .populate('medicineId', 'name brand sku')
    .populate('performedBy', 'firstName lastName')
    .sort({ movementDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await StockMovement.countDocuments(query);

  res.status(200).json({
    success: true,
    movements,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalMovements: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// ==================== BATCH MANAGEMENT ====================

export const getBatchDetails = catchAsyncErrors(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  const activeBatches = medicine.batches.filter(batch => batch.isActive);
  const expiredBatches = medicine.batches.filter(batch => 
    !batch.isActive || batch.expiryDate < new Date()
  );

  res.status(200).json({
    success: true,
    batches: {
      active: activeBatches,
      expired: expiredBatches,
      totalActive: activeBatches.length,
      totalExpired: expiredBatches.length
    }
  });
});

export const expireBatch = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { batchNo } = req.body;

  const medicine = await Medicine.findById(id);
  if (!medicine) {
    return next(new ErrorHandler("Medicine not found", 404));
  }

  const batch = medicine.batches.find(b => b.batchNo === batchNo);
  if (!batch) {
    return next(new ErrorHandler("Batch not found", 404));
  }

  // Mark batch as inactive
  batch.isActive = false;

  // Reduce stock by batch quantity
  const previousStock = medicine.currentStock;
  medicine.currentStock = Math.max(0, medicine.currentStock - batch.quantity);
  
  await medicine.save();

  // Create stock movement record
  const stockMovement = await StockMovement.create({
    medicineId: id,
    movementType: 'expired',
    quantity: -batch.quantity,
    previousStock: previousStock,
    newStock: medicine.currentStock,
    reason: `Batch ${batchNo} expired`,
    performedBy: req.user._id,
    batchNo: batchNo,
    expiryDate: batch.expiryDate
  });

  res.status(200).json({
    success: true,
    message: "Batch marked as expired",
    medicine,
    stockMovement
  });
});
