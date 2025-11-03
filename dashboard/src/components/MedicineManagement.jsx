import React, { useState, useEffect, useMemo } from 'react';
import axios from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FaPills, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaExclamationTriangle,
  FaClock,
  FaChartLine,
  FaBoxes,
  FaShoppingCart,
  FaCalendarAlt,
  FaWarehouse,
  FaDollarSign,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaDownload,
  FaUpload,
  FaHistory,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaEquals
} from 'react-icons/fa';

const MedicineManagement = () => {
  // Core data states
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState({ expiry: [], lowStock: [] });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // View states
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    brand: '',
    manufacturer: '',
    sku: '',
    category: 'Tablet',
    dosageForm: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    minimumStock: 10,
    maximumStock: 1000,
    unit: 'pieces'
  });

  const [stockData, setStockData] = useState({
    quantity: '',
    batchNo: '',
    expiryDate: '',
    supplier: '',
    costPrice: '',
    reason: ''
  });

  // Computed values
  const filteredMedicines = useMemo(() => {
    let filtered = medicines;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(medicine => medicine.status === statusFilter);
    }
    
    // Apply alerts filter
    if (showAlertsOnly) {
      filtered = filtered.filter(medicine => 
        medicine.isLowStock || medicine.isOutOfStock || medicine.isExpiringSoon
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [medicines, searchTerm, categoryFilter, statusFilter, showAlertsOnly, sortBy, sortOrder]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const totalFilteredPages = useMemo(() => {
    return Math.ceil(filteredMedicines.length / itemsPerPage);
  }, [filteredMedicines.length, itemsPerPage]);

  useEffect(() => {
    fetchMedicines();
    fetchAnalytics();
    fetchAlerts();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, categoryFilter, statusFilter, showAlertsOnly]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/medicine');
      if (response.data.success) {
        setMedicines(response.data.medicines);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/medicine/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const [expiryResponse, lowStockResponse] = await Promise.all([
        axios.get('/medicine/alerts/expiry'),
        axios.get('/medicine/alerts/low-stock')
      ]);

      if (expiryResponse.data.success) {
        setAlerts(prev => ({ ...prev, expiry: expiryResponse.data.expiringMedicines }));
      }

      if (lowStockResponse.data.success) {
        setAlerts(prev => ({ ...prev, lowStock: lowStockResponse.data.lowStockMedicines }));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/medicine', formData);
      if (response.data.success) {
        toast.success('Medicine added successfully');
        setShowAddForm(false);
        resetForm();
        fetchMedicines();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error(error.response?.data?.message || 'Failed to add medicine');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/medicine/${selectedMedicine._id}/stock/add`, {
        quantity: parseInt(stockData.quantity),
        batchInfo: {
          batchNo: stockData.batchNo,
          expiryDate: stockData.expiryDate,
          supplier: stockData.supplier,
          costPrice: parseFloat(stockData.costPrice),
          reason: stockData.reason
        }
      });

      if (response.data.success) {
        toast.success('Stock added successfully');
        setShowStockForm(false);
        resetStockForm();
        setSelectedMedicine(null);
        fetchMedicines();
        fetchAnalytics();
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error(error.response?.data?.message || 'Failed to add stock');
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to discontinue this medicine?')) {
      try {
        const response = await axios.delete(`/medicine/${id}`);
        if (response.data.success) {
          toast.success('Medicine discontinued successfully');
          fetchMedicines();
          fetchAnalytics();
        }
      } catch (error) {
        console.error('Error deleting medicine:', error);
        toast.error('Failed to delete medicine');
      }
    }
  };

  // Helper functions
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStockStatusColor = (medicine) => {
    if (medicine.isOutOfStock) return 'text-red-600';
    if (medicine.isLowStock) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusText = (medicine) => {
    if (medicine.isOutOfStock) return 'Out of Stock';
    if (medicine.isLowStock) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusIcon = (medicine) => {
    if (medicine.isOutOfStock) return <FaTimesCircle />;
    if (medicine.isLowStock) return <FaExclamationTriangle />;
    return <FaCheckCircle />;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      brand: '',
      manufacturer: '',
      sku: '',
      category: 'Tablet',
      dosageForm: '',
      description: '',
      costPrice: '',
      sellingPrice: '',
      minimumStock: 10,
      maximumStock: 1000,
      unit: 'pieces'
    });
  };

  const resetStockForm = () => {
    setStockData({
      quantity: '',
      batchNo: '',
      expiryDate: '',
      supplier: '',
      costPrice: '',
      reason: ''
    });
  };

  return (
    <div className="medicine-management page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1><FaPills /> Medicine Management</h1>
          <p>Track medicines, manage stock, and monitor expiry alerts</p>
          <div className="header-stats">
            <span className="stat-item">
              <FaPills /> {medicines.length} Total Medicines
            </span>
            <span className="stat-item">
              <FaExclamationTriangle /> {alerts.lowStock.length + alerts.expiry.length} Alerts
            </span>
          </div>
        </div>
        <div className="header-actions">
          
          
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <FaPlus /> Add Medicine
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon">
              <FaPills />
            </div>
            <div className="analytics-content">
              <h3>Total Medicines</h3>
              <p>{analytics.totalMedicines}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <FaExclamationTriangle />
            </div>
            <div className="analytics-content">
              <h3>Out of Stock</h3>
              <p className="text-red-600">{analytics.outOfStock}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <FaClock />
            </div>
            <div className="analytics-content">
              <h3>Low Stock</h3>
              <p className="text-yellow-600">{analytics.lowStock}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <FaCalendarAlt />
            </div>
            <div className="analytics-content">
              <h3>Expiring Soon</h3>
              <p className="text-orange-600">{analytics.expiringSoon}</p>
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-icon">
              <FaDollarSign />
            </div>
            <div className="analytics-content">
              <h3>Stock Value</h3>
              <p>{formatCurrency(analytics.totalStockValue)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {(alerts.expiry.length > 0 || alerts.lowStock.length > 0) && (
        <div className="alerts-section">
          <h2><FaExclamationTriangle /> Alerts</h2>
          
          {alerts.expiry.length > 0 && (
            <div className="alert-group">
              <h3>Expiring Medicines</h3>
              <div className="alert-list">
                {alerts.expiry.slice(0, 5).map((item, index) => (
                  <div key={index} className="alert-item expiry">
                    <div className="alert-content">
                      <h4>{item.medicine.name}</h4>
                      <p>{item.expiringBatches.length} batches expiring soon</p>
                    </div>
                    <div className="alert-action">
                      <span className="alert-badge">Expiring</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.lowStock.length > 0 && (
            <div className="alert-group">
              <h3>Low Stock Medicines</h3>
              <div className="alert-list">
                {alerts.lowStock.slice(0, 5).map((medicine, index) => (
                  <div key={index} className="alert-item low-stock">
                    <div className="alert-content">
                      <h4>{medicine.name}</h4>
                      <p>Current stock: {medicine.currentStock} {medicine.unit}</p>
                    </div>
                    <div className="alert-action">
                      <span className="alert-badge">Low Stock</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search medicines by name, brand, SKU, or generic name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <FaTimesCircle />
              </button>
            )}
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Ointment">Ointment</option>
              <option value="Drops">Drops</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaInfoCircle className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div className="filter-group">
            <FaSort className="filter-icon" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="currentStock-desc">Stock High-Low</option>
              <option value="currentStock-asc">Stock Low-High</option>
              <option value="sellingPrice-desc">Price High-Low</option>
              <option value="sellingPrice-asc">Price Low-High</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="medicines-table">
        <div className="table-header">
          <div className="table-title">
            <h2>Medicines Inventory</h2>
            <div className="table-info">
              <span className="table-count">
                {filteredMedicines.length} of {medicines.length} medicines
              </span>
              {showAlertsOnly && (
                <span className="alert-filter-badge">
                  <FaExclamationTriangle /> Alerts Only
                </span>
              )}
            </div>
          </div>
          <div className="table-actions">
            <button 
              className="btn-icon"
              onClick={() => fetchMedicines()}
              title="Refresh data"
            >
              <FaHistory />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading medicines...</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('name')}
                  >
                    <div className="th-content">
                      Medicine {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('category')}
                  >
                    <div className="th-content">
                      Category {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('currentStock')}
                  >
                    <div className="th-content">
                      Stock {getSortIcon('currentStock')}
                    </div>
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('sellingPrice')}
                  >
                    <div className="th-content">
                      Price {getSortIcon('sellingPrice')}
                    </div>
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('status')}
                  >
                    <div className="th-content">
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMedicines.map((medicine) => (
                  <tr key={medicine._id} className={medicine.isOutOfStock ? 'out-of-stock' : medicine.isLowStock ? 'low-stock' : ''}>
                    <td>
                      <div className="medicine-info">
                        <div className="medicine-name">
                          <h4>{medicine.name}</h4>
                          {medicine.isExpiringSoon && (
                            <span className="expiry-warning" title="Expiring soon">
                              <FaCalendarAlt />
                            </span>
                          )}
                        </div>
                        <p className="medicine-details">
                          {medicine.brand && `${medicine.brand} • `}
                          {medicine.sku && `${medicine.sku} • `}
                          {medicine.dosageForm}
                        </p>
                        {medicine.genericName && (
                          <small className="generic-name">Generic: {medicine.genericName}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{medicine.category}</span>
                    </td>
                    <td>
                      <div className="stock-info">
                        <div className="stock-quantity-row">
                          <span className={`stock-quantity ${getStockStatusColor(medicine)}`}>
                            {medicine.currentStock} {medicine.unit}
                          </span>
                          <span className={`stock-status-icon ${getStockStatusColor(medicine)}`}>
                            {getStockStatusIcon(medicine)}
                          </span>
                        </div>
                        <small className={getStockStatusColor(medicine)}>
                          {getStockStatusText(medicine)}
                        </small>
                        {medicine.minimumStock && (
                          <small className="min-stock">
                            Min: {medicine.minimumStock} {medicine.unit}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="price-info">
                        <div className="price-row">
                          <span className="selling-price">{formatCurrency(medicine.sellingPrice)}</span>
                          {medicine.margin > 0 && (
                            <span className="margin-badge">
                              {medicine.margin.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <small className="cost-price">Cost: {formatCurrency(medicine.costPrice)}</small>
                        {medicine.stockValue > 0 && (
                          <small className="stock-value">
                            Value: {formatCurrency(medicine.stockValue)}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="status-container">
                        <span className={`status-badge ${medicine.status}`}>
                          {medicine.status}
                        </span>
                        {medicine.isExpiringSoon && (
                          <span className="expiry-badge" title="Expiring soon">
                            <FaCalendarAlt /> Soon
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setShowStockForm(true);
                          }}
                          title="Add Stock"
                        >
                          <FaArrowUp />
                        </button>
                       
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteMedicine(medicine._id)}
                          title="Delete Medicine"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalFilteredPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of {filteredMedicines.length} medicines
              </span>
            </div>
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="pagination-btn"
              >
                <FaArrowDown /> Previous
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalFilteredPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalFilteredPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalFilteredPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                disabled={currentPage === totalFilteredPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="pagination-btn"
              >
                Next <FaArrowUp />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Medicine</h3>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddMedicine} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Cream">Cream</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Dosage Form</label>
                  <input
                    type="text"
                    value={formData.dosageForm}
                    onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                    placeholder="e.g., 500mg, 10ml"
                  />
                </div>
                
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="pieces">Pieces</option>
                    <option value="strips">Strips</option>
                    <option value="bottles">Bottles</option>
                    <option value="boxes">Boxes</option>
                    <option value="vials">Vials</option>
                    <option value="tubes">Tubes</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Cost Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Selling Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Minimum Stock</label>
                  <input
                    type="number"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({...formData, minimumStock: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Maximum Stock</label>
                  <input
                    type="number"
                    value={formData.maximumStock}
                    onChange={(e) => setFormData({...formData, maximumStock: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockForm && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Stock - {selectedMedicine.name}</h3>
              <button onClick={() => setShowStockForm(false)}>×</button>
            </div>
            <form onSubmit={handleAddStock} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    value={stockData.quantity}
                    onChange={(e) => setStockData({...stockData, quantity: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    value={stockData.batchNo}
                    onChange={(e) => setStockData({...stockData, batchNo: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={stockData.expiryDate}
                    onChange={(e) => setStockData({...stockData, expiryDate: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={stockData.supplier}
                    onChange={(e) => setStockData({...stockData, supplier: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockData.costPrice}
                    onChange={(e) => setStockData({...stockData, costPrice: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Reason</label>
                  <input
                    type="text"
                    value={stockData.reason}
                    onChange={(e) => setStockData({...stockData, reason: e.target.value})}
                    placeholder="e.g., New purchase, Restock"
                  />
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowStockForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
