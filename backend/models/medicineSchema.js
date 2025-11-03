import mongoose from "mongoose";

// Sales tracking schema
const salesRecordSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.ObjectId, ref: "Medicine", required: true },
  quantitySold: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  soldTo: { type: String }, // Patient name or invoice reference
  soldBy: { type: mongoose.Schema.ObjectId, ref: "User" }, // Staff member who sold
  saleDate: { type: Date, default: Date.now },
  invoiceId: { type: mongoose.Schema.ObjectId, ref: "Invoice" },
});

// Stock movement schema
const stockMovementSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.ObjectId, ref: "Medicine", required: true },
  movementType: { 
    type: String, 
    enum: ['purchase', 'sale', 'adjustment', 'expired', 'damaged'],
    required: true 
  },
  quantity: { type: Number, required: true }, // Positive for incoming, negative for outgoing
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: String,
  performedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
  movementDate: { type: Date, default: Date.now },
  batchNo: String,
  expiryDate: Date,
});

const medicineSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Medicine name is required"],
    trim: true,
    index: true
  },
  genericName: { type: String, trim: true },
  brand: { type: String, trim: true },
  manufacturer: { type: String, trim: true },
  sku: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true,
    uppercase: true
  },
  category: { 
    type: String, 
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Other'],
    default: 'Other'
  },
  dosageForm: { type: String, trim: true }, // e.g., "500mg", "10ml"
  description: { type: String, trim: true },
  
  // Stock Management
  currentStock: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 10 }, // Alert threshold
  maximumStock: { type: Number, default: 1000 },
  unit: { 
    type: String, 
    enum: ['pieces', 'strips', 'bottles', 'boxes', 'vials', 'tubes'],
    default: 'pieces'
  },
  
  // Pricing
  costPrice: { type: Number, default: 0, min: 0 }, // Purchase price
  sellingPrice: { type: Number, default: 0, min: 0 }, // Selling price
  margin: { type: Number, default: 0 }, // Profit margin percentage
  
  // Batch Information
  batches: [{
    batchNo: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    purchaseDate: { type: Date, default: Date.now },
    supplier: { type: String },
    costPrice: { type: Number },
    isActive: { type: Boolean, default: true }
  }],
  
  // Tracking
  totalSold: { type: Number, default: 0 },
  totalPurchased: { type: Number, default: 0 },
  lastRestocked: { type: Date },
  lastSold: { type: Date },
  
  // Status and Alerts
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isExpiringSoon: { type: Boolean, default: false },
  isLowStock: { type: Boolean, default: false },
  isOutOfStock: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // Sales and Stock Movement References
  salesRecords: [{ type: mongoose.Schema.ObjectId, ref: "SalesRecord" }],
  stockMovements: [{ type: mongoose.Schema.ObjectId, ref: "StockMovement" }]
});

// Indexes for better performance
medicineSchema.index({ name: 1, brand: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ isExpiringSoon: 1 });
medicineSchema.index({ isLowStock: 1 });
medicineSchema.index({ status: 1 });

// Pre-save middleware to update stock status and calculate margins
medicineSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate margin
  if (this.costPrice > 0 && this.sellingPrice > 0) {
    this.margin = ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }
  
  // Update stock status flags
  this.isOutOfStock = this.currentStock === 0;
  this.isLowStock = this.currentStock <= this.minimumStock;
  
  // Check for expiring batches (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  this.isExpiringSoon = this.batches.some(batch => 
    batch.isActive && batch.expiryDate <= thirtyDaysFromNow
  );
  
  next();
});

// Virtual for total value of current stock
medicineSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.sellingPrice;
});

// Virtual for days until expiry (for the earliest expiring batch)
medicineSchema.virtual('daysUntilExpiry').get(function() {
  const activeBatches = this.batches.filter(batch => batch.isActive);
  if (activeBatches.length === 0) return null;
  
  const earliestExpiry = new Date(Math.min(...activeBatches.map(batch => batch.expiryDate)));
  const today = new Date();
  const diffTime = earliestExpiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Methods
medicineSchema.methods.addStock = function(quantity, batchInfo = {}) {
  this.currentStock += quantity;
  this.totalPurchased += quantity;
  this.lastRestocked = new Date();
  
  if (batchInfo.batchNo) {
    this.batches.push({
      batchNo: batchInfo.batchNo,
      quantity: quantity,
      expiryDate: batchInfo.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
      purchaseDate: batchInfo.purchaseDate || new Date(),
      supplier: batchInfo.supplier,
      costPrice: batchInfo.costPrice || this.costPrice
    });
  }
  
  return this.save();
};

medicineSchema.methods.reduceStock = function(quantity) {
  if (this.currentStock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  this.currentStock -= quantity;
  this.totalSold += quantity;
  this.lastSold = new Date();
  
  return this.save();
};

medicineSchema.methods.getExpiringBatches = function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + days);
  
  return this.batches.filter(batch => 
    batch.isActive && batch.expiryDate <= cutoffDate
  );
};

medicineSchema.methods.getLowStockBatches = function() {
  return this.batches.filter(batch => 
    batch.isActive && batch.quantity <= this.minimumStock
  );
};

// Create separate models for sales and stock movements
export const SalesRecord = mongoose.model("SalesRecord", salesRecordSchema);
export const StockMovement = mongoose.model("StockMovement", stockMovementSchema);
export const Medicine = mongoose.model("Medicine", medicineSchema);
