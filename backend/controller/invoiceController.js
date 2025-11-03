import { Invoice } from "../models/invoiceSchema.js";
import { Medicine, StockMovement } from "../models/medicineSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

export const createInvoice = catchAsyncErrors(async (req, res) => {
  const { patientId, appointmentId, items, tax = 0 } = req.body;
  
  // Validate required fields - check for empty strings and null/undefined
  if (!patientId || patientId === '') {
    return res.status(400).json({ 
      success: false, 
      message: 'Patient ID is required' 
    });
  }
  
  // Clean up appointmentId - if it's empty string, set to undefined
  const cleanAppointmentId = appointmentId === '' ? undefined : appointmentId;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'At least one item is required' 
    });
  }
  
  // Validate each item
  for (const item of items) {
    if (!item.description || item.qty === undefined || item.qty === null || item.unitPrice === undefined || item.unitPrice === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Each item must have description, quantity, and unit price' 
      });
    }
  }
  
  // calculate totals
  let subtotal = 0;
  for (const it of items) {
    it.total = (it.qty || 1) * (it.unitPrice || 0);
    subtotal += it.total;
  }
  const total = subtotal + Number(tax || 0);

  try {
    const invoice = await Invoice.create({ 
      patientId, 
      appointmentId: cleanAppointmentId, 
      items, 
      subtotal, 
      tax, 
      total 
    });
    
    // decrement medicine stock for items that reference medicineId
    for (const it of items) {
      if (it.medicineId) {
        const medicine = await Medicine.findById(it.medicineId);
        if (!medicine) {
          return res.status(400).json({
            success: false,
            message: `Medicine with ID ${it.medicineId} not found`
          });
        }
        
        // Check if enough stock is available
        if (medicine.currentStock < (it.qty || 1)) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for medicine ${medicine.name}. Available: ${medicine.currentStock}, Requested: ${it.qty}`
          });
        }

        // Update stock
        medicine.currentStock -= Math.abs(it.qty || 1);
        
        // Create stock movement record
        const stockMovement = await StockMovement.create({
          medicineId: medicine._id,
          movementType: 'sale',
          quantity: -Math.abs(it.qty || 1),
          previousStock: medicine.currentStock + Math.abs(it.qty || 1),
          newStock: medicine.currentStock,
          reason: `Sold via Invoice #${invoice._id}`,
          performedBy: req.user._id
        });

        // Add movement to medicine's history
        medicine.stockMovements.push(stockMovement._id);
        medicine.lastSold = new Date();
        medicine.totalSold += Math.abs(it.qty || 1);
        
        await medicine.save();
      }
    }
    
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    console.error('Invoice creation error:', err);
    
    // Handle specific MongoDB validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message).join(', ');
      return res.status(400).json({ 
        success: false, 
        message: `Validation error: ${validationErrors}` 
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate invoice detected' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to create invoice' 
    });
  }
});

export const getInvoice = catchAsyncErrors(async (req, res) => {
  const inv = await Invoice.findById(req.params.id).populate("patientId", "firstName lastName email");
  if (!inv) return res.status(404).json({ success: false });
  res.status(200).json({ success: true, inv });
});

export const markPaid = catchAsyncErrors(async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ success: false });
  inv.paid = true;
  await inv.save();
  res.status(200).json({ success: true, inv });
});

export const getPatientInvoices = catchAsyncErrors(async (req, res) => {
  const invoices = await Invoice.find({ patientId: req.user._id })
    .populate('patientId', 'firstName lastName email')
    .populate('appointmentId', 'appointment_date department doctorName status')
    .populate({
      path: 'items.medicineId',
      select: 'name description'
    })
    .sort('-createdAt');
  res.status(200).json({ success: true, invoices });
});

export const getAllInvoices = catchAsyncErrors(async (req, res) => {
  const invoices = await Invoice.find()
    .populate('patientId', 'firstName lastName email')
    .populate('appointmentId', 'appointment_date department doctorName status')
    .populate({
      path: 'items.medicineId',
      select: 'name description'
    })
    .sort('-createdAt');
  res.status(200).json({ success: true, invoices });
});

export const getInvoicesByPatientId = catchAsyncErrors(async (req, res) => {
  const { patientId } = req.params;
  
  if (!patientId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Patient ID is required' 
    });
  }

  const invoices = await Invoice.find({ patientId })
    .populate('patientId', 'firstName lastName email phone')
    .populate('appointmentId', 'appointment_date department status')
    .sort('-createdAt');
    
  res.status(200).json({ 
    success: true, 
    invoices,
    patient: invoices.length > 0 ? invoices[0].patientId : null
  });
});