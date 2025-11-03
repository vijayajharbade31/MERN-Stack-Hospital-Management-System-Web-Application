import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FaFileInvoice, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaChartLine,
  FaReceipt,
  FaUser,
  FaCalendarAlt,
  FaTimes,
  FaEdit,
  FaTrash,
  FaDownload,
  FaPrint
} from 'react-icons/fa';
import './InvoiceManagement.css';

const InvoiceManagement = () => {
  // Core data states
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidInvoices: 0,
    pendingInvoices: 0
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    items: [],
    tax: 0,
    appointment: null
  });

  const [newItem, setNewItem] = useState({
    description: '',
    qty: 1,
    unitPrice: 0,
    medicineId: ''
  });

  const [patientAppointments, setPatientAppointments] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchInvoices();
    fetchPatients();
    fetchMedicines();
  }, []);

  // Fetch appointments when a patient is selected
  const fetchPatientAppointments = async (patientId) => {
    try {
      const { data } = await axios.get(`/appointment/getall`);
      if (data.success) {
        // Filter appointments for the selected patient and completed ones
        const patientAppointments = data.appointments.filter(apt => 
          (apt.patientId === patientId || apt.email === formData.patientId) && 
          (apt.status?.toLowerCase() === 'completed' || apt.status?.toLowerCase() === 'accepted')
        );
        console.log('Fetched appointments:', patientAppointments); // Debug log
        setPatientAppointments(patientAppointments);
      }
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      toast.error('Failed to fetch patient appointments');
    }
  };

  // Calculate analytics when invoices change
  useEffect(() => {
    calculateAnalytics();
  }, [invoices]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/invoice/all');
      setInvoices(data.invoices || []);
    } catch (error) {
      toast.error('Failed to fetch invoices');
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await axios.get('/user/patients');
      setPatients(data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients: ' + (error.message || 'Unknown error'));
    }
  };

  const fetchMedicines = async () => {
    try {
      const { data } = await axios.get('/medicine');
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const calculateAnalytics = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.paid).length;
    const pendingInvoices = totalInvoices - paidInvoices;

    setAnalytics({
      totalInvoices,
      totalRevenue,
      paidInvoices,
      pendingInvoices
    });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
    if (!formData.patientId || formData.patientId === '') {
      toast.error('Please select a patient');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      
      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
      const tax = parseFloat(formData.tax) || 0;
      const total = subtotal + tax;

      // Prepare clean data
      const cleanData = {
        patientId: formData.patientId,
        appointmentId: formData.appointmentId === '' ? undefined : formData.appointmentId,
        items: formData.items.map(item => ({
          ...item,
          total: item.qty * item.unitPrice
        })),
        subtotal,
        tax,
        total
      };
      
      console.log('Creating invoice with data:', cleanData);
      const response = await axios.post('/invoice', cleanData);
      console.log('Invoice creation response:', response.data);
      toast.success('Invoice created successfully');
      setShowCreateForm(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error('Invoice creation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await axios.patch(`/invoice/${invoiceId}`);
      toast.success('Invoice marked as paid');
      fetchInvoices();
    } catch (error) {
      toast.error('Failed to update invoice status');
    }
  };

  const addItem = () => {
    if (!newItem.description || !newItem.qty || !newItem.unitPrice) {
      toast.error('Please fill in all item fields');
      return;
    }

    const qty = parseFloat(newItem.qty);
    const unitPrice = parseFloat(newItem.unitPrice);
    
    if (isNaN(qty) || isNaN(unitPrice)) {
      toast.error('Invalid quantity or price');
      return;
    }

    const item = {
      ...newItem,
      qty: qty,
      unitPrice: unitPrice,
      total: qty * unitPrice
    };

    setFormData(prev => {
      const updatedItems = [...prev.items, item];
      const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const tax = parseFloat(prev.tax) || 0;
      
      return {
        ...prev,
        items: updatedItems,
        subtotal: subtotal,
        total: subtotal + tax
      };
    });

    // Reset new item form
    setNewItem({
      description: '',
      qty: '',
      unitPrice: '',
      medicineId: '',
      total: 0
    });
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      appointmentId: '',
      items: [],
      tax: ''
    });
    setNewItem({
      description: '',
      qty: '',
      unitPrice: '',
      medicineId: ''
    });
  };

  // Calculate totals directly in render to ensure real-time updates

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patientId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.patientId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && invoice.paid) ||
                         (statusFilter === 'pending' && !invoice.paid);

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page">
      <div className="header">
        <h2>Invoice Management</h2>
      </div>

      {/* Analytics Cards */}
      <div className="stats">
        <div className="stat">
          <div className="stat-icon">
            <FaFileInvoice />
          </div>
          <h4>Total Invoices</h4>
          <span>{analytics.totalInvoices}</span>
        </div>
        <div className="stat">
          <div className="stat-icon">
            <FaDollarSign />
          </div>
          <h4>Total Revenue</h4>
          <span>{formatCurrency(analytics.totalRevenue)}</span>
        </div>
        <div className="stat">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <h4>Paid Invoices</h4>
          <span>{analytics.paidInvoices}</span>
        </div>
        <div className="stat">
          <div className="stat-icon">
            <FaClock />
          </div>
          <h4>Pending Invoices</h4>
          <span>{analytics.pendingInvoices}</span>
        </div>
      </div>

      {/* Create Invoice Form */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Invoice</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="modal-form">
              <div className="formGrid">
                <div className="formField">
                  <label>Patient *</label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => {
                      const patientId = e.target.value;
                      console.log('Selected patient:', patientId); // Debug log
                      setFormData(prev => ({ ...prev, patientId, appointmentId: '', appointment: null }));
                      if (patientId) {
                        fetchPatientAppointments(patientId);
                      } else {
                        setPatientAppointments([]); // Clear appointments if no patient selected
                      }
                    }}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="formField">
                  <label>Appointment</label>
                  <select
                    value={formData.appointmentId}
                    onChange={(e) => {
                      const appointment = patientAppointments.find(a => a._id === e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        appointmentId: e.target.value,
                        appointment,
                        // Add default consultation fee when appointment is selected
                        items: [
                          {
                            description: 'Consultation Fee',
                            qty: 1,
                            unitPrice: 500, // Default consultation fee
                            total: 500
                          }
                        ]
                      }));
                    }}
                  >
                    <option value="">Select Appointment</option>
                    {patientAppointments && patientAppointments.map(apt => (
                      <option key={apt._id} value={apt._id}>
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })} - {apt.department} - Dr. {apt.doctor?.firstName || apt.doctorName || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="formField">
                  <label>Consulting Fees</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Add Items Section */}
              <div className="addItemSection">
                <h4>Add Items</h4>
                <div className="addItemForm">
                  <div className="formGrid">
                    <div className="formField">
                      <label>Description *</label>
                      <input
                        type="text"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="formField">
                      <label>Medicine (Optional)</label>
                      <select
                        value={newItem.medicineId}
                        onChange={(e) => {
                          const medicine = medicines.find(m => m._id === e.target.value);
                          if (medicine) {
                            const qty = newItem.qty || 1;
                            const price = medicine.sellingPrice || 0;
                            setNewItem(prev => ({
                              ...prev,
                              medicineId: e.target.value,
                              description: medicine.name,
                              unitPrice: price,
                              qty: qty,
                              total: qty * price
                            }));
                          } else {
                            setNewItem(prev => ({
                              ...prev,
                              medicineId: '',
                              description: '',
                              unitPrice: '',
                              qty: '',
                              total: 0
                            }));
                          }
                        }}
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(medicine => (
                          <option key={medicine._id} value={medicine._id}>
                            {medicine.name} - {formatCurrency(medicine.sellingPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="formField">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={newItem.qty}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewItem(prev => ({
                            ...prev,
                            qty: value,
                            total: value && prev.unitPrice ? parseFloat(value) * parseFloat(prev.unitPrice) : 0
                          }));
                        }}
                        placeholder="Enter quantity"
                      />
                    </div>
                    <div className="formField">
                      <label>Unit Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newItem.unitPrice}
                        onChange={(e) => {
                          const value = e.target.value;
                          setNewItem(prev => ({
                            ...prev,
                            unitPrice: value,
                            total: value && prev.qty ? parseFloat(value) * parseFloat(prev.qty) : 0
                          }));
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="addBtn"
                    onClick={addItem}
                  >
                    <FaPlus /> Add Item
                  </button>
                </div>

                {/* Items List */}
                {formData.items.length > 0 && (
                  <div className="itemsList">
                    {formData.items.map((item, index) => (
                      <div key={index} className="itemRow">
                        <div className="itemType">ITEM</div>
                        <div className="itemName">{item.description}</div>
                        <div className="itemQty">{item.qty}</div>
                        <div className="itemPrice">{formatCurrency(item.unitPrice)}</div>
                        <div className="itemSubtotal">{formatCurrency(item.total)}</div>
                        <button
                          type="button"
                          className="removeBtn"
                          onClick={() => removeItem(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total Section */}
                <div className="totalSection">
                  <div className="totalAmount">
                    <h5>Subtotal: {formatCurrency(formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0))}</h5>
                    <h5>Tax: {formatCurrency(parseFloat(formData.tax) || 0)}</h5>
                    <h5>Total: {formatCurrency(formData.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0) + (parseFloat(formData.tax) || 0))}</h5>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="invoiceListCard">
        <div className="invoiceListHeader">
          <h3>Invoices</h3>
          <div className="searchBar">
            <div className="searchInput">
              <FaSearch />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filterSelect"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <button
              className="addBtn"
              onClick={() => setShowCreateForm(true)}
            >
              <FaPlus /> New Invoice
            </button>
          </div>
        </div>
        <div className="invoiceListBody">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <FaReceipt />
              <h4>No invoices found</h4>
              <p>Create your first invoice to get started</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(invoice => (
                    <tr key={invoice._id}>
                      <td>#{invoice._id.slice(-8)}</td>
                      <td>
                        <div>
                          <strong>{invoice.patientId?.firstName} {invoice.patientId?.lastName}</strong>
                          <br />
                          <small>{invoice.patientId?.email}</small>
                        </div>
                      </td>
                      <td>{formatDate(invoice.createdAt)}</td>
                      <td>{invoice.items?.length || 0} items</td>
                      <td>{formatCurrency(invoice.total || 0)}</td>
                      <td>
                        <span className={`status-badge ${invoice.paid ? 'paid' : 'pending'}`}>
                          {invoice.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="actionBtn"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetailsModal(true);
                            }}
                          >
                            <FaEye /> View
                          </button>
                          {!invoice.paid && (
                            <button
                              className="actionBtn"
                              onClick={() => handleMarkPaid(invoice._id)}
                              style={{ background: '#28a745' }}
                            >
                              <FaCheckCircle /> Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invoice Details - #{selectedInvoice._id.slice(-8)}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-form">
              <div className="formGrid">
                <div className="formField">
                  <label>Patient</label>
                  <div>
                    <strong>{selectedInvoice.patientId?.firstName} {selectedInvoice.patientId?.lastName}</strong>
                    <br />
                    <small>{selectedInvoice.patientId?.email}</small>
                  </div>
                </div>
                <div className="formField">
                  <label>Date Created</label>
                  <div>{formatDate(selectedInvoice.createdAt)}</div>
                </div>
                <div className="formField">
                  <label>Status</label>
                  <span className={`status-badge ${selectedInvoice.paid ? 'paid' : 'pending'}`}>
                    {selectedInvoice.paid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="formField">
                  <label>Total Amount</label>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {formatCurrency(selectedInvoice.total || 0)}
                  </div>
                </div>
              </div>

              <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Invoice Items</h4>
              <div className="itemsList">
                {selectedInvoice.items?.map((item, index) => (
                  <div key={index} className="itemRow">
                    <div className="itemType">ITEM</div>
                    <div className="itemName">{item.description}</div>
                    <div className="itemQty">{item.qty}</div>
                    <div className="itemPrice">{formatCurrency(item.unitPrice)}</div>
                    <div className="itemSubtotal">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>

              <div className="totalSection">
                <div className="totalAmount">
                  <h5>Subtotal: {formatCurrency(selectedInvoice.subtotal || 0)}</h5>
                  <h5>Tax: {formatCurrency(selectedInvoice.tax || 0)}</h5>
                  <h5>Total: {formatCurrency(selectedInvoice.total || 0)}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
