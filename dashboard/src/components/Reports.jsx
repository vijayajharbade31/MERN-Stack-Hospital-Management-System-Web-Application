import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FaChartLine, 
  FaChartPie, 
  FaDownload, 
  FaFilePdf, 
  FaFileExcel,
  FaCalendarAlt,
  FaUsers,
  FaDollarSign,
  FaPills,
  FaExclamationTriangle,
  FaSearch,
  FaSort,
  FaRedo,
  FaTimesCircle,
  FaUser,
  FaCalendar,
  FaMoneyBill,
  FaCapsules,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import './Reports.css';

const Reports = () => {
  const [overallStats, setOverallStats] = useState(null);
  const [dailyPatients, setDailyPatients] = useState([]);
  const [monthlyPatients, setMonthlyPatients] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [pharmacySales, setPharmacySales] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('7');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchOverallStats(); // Always fetch overall stats
    
    if (reportType === 'patients') {
      fetchDailyPatients();
      fetchMonthlyPatients();
      fetchDepartmentData();
    } else if (reportType === 'revenue') {
      fetchDailyRevenue();
      fetchMonthlyRevenue();
    } else if (reportType === 'pharmacy') {
      fetchPharmacySales();
      fetchTopMedicines();
      fetchLowStockMedicines();
    }
  }, [reportType, timeRange]);

  const fetchOverallStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching overall stats...');
      const { data } = await axios.get('/reports/stats/overall');
      console.log('Overall stats response:', data);
      setOverallStats(data.stats);
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      toast.error('Failed to fetch overall statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyPatients = async () => {
    try {
      const { data } = await axios.get(`/reports/patients/daily?days=${timeRange}`);
      setDailyPatients(data.results);
    } catch (error) {
      toast.error('Failed to fetch daily patient data');
    }
  };

  const fetchMonthlyPatients = async () => {
    try {
      const { data } = await axios.get(`/reports/patients/monthly?months=${timeRange}`);
      setMonthlyPatients(data.results);
    } catch (error) {
      toast.error('Failed to fetch monthly patient data');
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const { data } = await axios.get(`/reports/revenue/daily?days=${timeRange}`);
      setDailyRevenue(data.results);
    } catch (error) {
      toast.error('Failed to fetch daily revenue data');
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const { data } = await axios.get(`/reports/revenue/trend?months=${timeRange}`);
      setMonthlyRevenue(data.results);
    } catch (error) {
      toast.error('Failed to fetch monthly revenue data');
    }
  };

  const fetchPharmacySales = async () => {
    try {
      const { data } = await axios.get(`/reports/pharmacy/sales?days=${timeRange}`);
      setPharmacySales(data.results);
    } catch (error) {
      toast.error('Failed to fetch pharmacy sales data');
    }
  };

  const fetchTopMedicines = async () => {
    try {
      const { data } = await axios.get(`/reports/pharmacy/top-selling?days=${timeRange}&limit=10`);
      setTopMedicines(data.results);
    } catch (error) {
      toast.error('Failed to fetch top selling medicines');
    }
  };

  const fetchLowStockMedicines = async () => {
    try {
      const { data } = await axios.get('/reports/pharmacy/low-stock');
      setLowStockMedicines(data.results);
    } catch (error) {
      toast.error('Failed to fetch low stock medicines');
    }
  };

  const fetchDepartmentData = async () => {
    try {
      const { data } = await axios.get(`/reports/patients/departments?months=${timeRange}`);
      setDepartmentData(data.results);
    } catch (error) {
      toast.error('Failed to fetch department data');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const refreshData = () => {
    fetchOverallStats();
    if (reportType === 'patients') {
      fetchDailyPatients();
      fetchMonthlyPatients();
      fetchDepartmentData();
    } else if (reportType === 'revenue') {
      fetchDailyRevenue();
      fetchMonthlyRevenue();
    } else if (reportType === 'pharmacy') {
      fetchPharmacySales();
      fetchTopMedicines();
      fetchLowStockMedicines();
    }
  };

  const exportToPDF = async () => {
    try {
      const { data } = await axios.get(`/reports/export?type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 30px; }
              .date-range { margin-bottom: 20px; }
              .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Hospital Management System - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
              <div class="date-range">
                <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
                <p>Generated: ${new Date().toLocaleString()}</p>
              </div>
            </div>
            <div class="summary">
              <h2>Overview Summary</h2>
              <p><strong>Total Patients:</strong> ${formatNumber(overallStats?.patients?.total || 0)}</p>
              <p><strong>Total Revenue:</strong> ${formatCurrency(overallStats?.revenue?.total || 0)}</p>
              <p><strong>Total Appointments:</strong> ${formatNumber(overallStats?.appointments?.total || 0)}</p>
              <p><strong>Total Medicines:</strong> ${formatNumber(overallStats?.medicines?.total || 0)}</p>
            </div>
            <div id="report-content">
              ${generateReportContent(reportType, data.data)}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      toast.success('Report exported to PDF successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const exportToExcel = async () => {
    try {
      const { data } = await axios.get(`/reports/export?type=${reportType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);

      let csvContent = '';
      const exportData = data.data;

      if (reportType === 'overview') {
        csvContent = 'Metric,Value\n';
        csvContent += `Total Patients,${overallStats?.patients?.total || 0}\n`;
        csvContent += `Monthly Patients,${overallStats?.patients?.monthly || 0}\n`;
        csvContent += `Total Doctors,${overallStats?.doctors?.total || 0}\n`;
        csvContent += `Total Appointments,${overallStats?.appointments?.total || 0}\n`;
        csvContent += `Pending Appointments,${overallStats?.appointments?.pending || 0}\n`;
        csvContent += `Total Revenue,${overallStats?.revenue?.total || 0}\n`;
        csvContent += `Monthly Revenue,${overallStats?.revenue?.monthly || 0}\n`;
        csvContent += `Total Medicines,${overallStats?.medicines?.total || 0}\n`;
        csvContent += `Low Stock Medicines,${overallStats?.medicines?.lowStock || 0}\n`;
        csvContent += `Out of Stock Medicines,${overallStats?.medicines?.outOfStock || 0}\n`;
      } else if (reportType === 'patients' && exportData.length > 0) {
        csvContent = 'Patient Name,Email,Phone,Appointment Date,Department,Status\n';
        exportData.forEach(item => {
          csvContent += `"${item.firstName} ${item.lastName}","${item.email}","${item.phone}","${item.appointment_date}","${item.department}","${item.status}"\n`;
        });
      } else if (reportType === 'revenue' && exportData.length > 0) {
        csvContent = 'Patient Name,Invoice Date,Subtotal,Tax,Total,Paid\n';
        exportData.forEach(item => {
          csvContent += `"${item.patientId?.firstName} ${item.patientId?.lastName}","${new Date(item.createdAt).toLocaleDateString()}","${item.subtotal}","${item.tax}","${item.total}","${item.paid ? 'Yes' : 'No'}"\n`;
        });
      } else if (reportType === 'pharmacy' && exportData.length > 0) {
        csvContent = 'Medicine Name,Brand,Category,Quantity Sold,Unit Price,Total Amount,Sale Date\n';
        exportData.forEach(item => {
          csvContent += `"${item.medicineId?.name || 'N/A'}","${item.medicineId?.brand || 'N/A'}","${item.medicineId?.category || 'N/A'}","${item.quantitySold || 0}","${item.unitPrice || 0}","${item.totalAmount || 0}","${new Date(item.saleDate).toLocaleDateString()}"\n`;
        });
      } else if (reportType === 'overview') {
        csvContent = 'Metric,Value\n';
        csvContent += `Total Patients,${exportData.patients || 0}\n`;
        csvContent += `Total Doctors,${exportData.doctors || 0}\n`;
        csvContent += `Total Appointments,${exportData.appointments || 0}\n`;
        csvContent += `Total Invoices,${exportData.invoices || 0}\n`;
        csvContent += `Total Revenue,${exportData.revenue || 0}\n`;
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported to Excel successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const generateReportContent = (reportType, data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return '<p>No data available for the selected period.</p>';
    }

    let content = '';

    if (reportType === 'patients') {
      content = `
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Appointment Date</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.firstName} ${item.lastName}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>${item.appointment_date}</td>
                <td>${item.department}</td>
                <td>${item.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'revenue') {
      content = `
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Invoice Date</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.patientId?.firstName} ${item.patientId?.lastName}</td>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                <td>${formatCurrency(item.subtotal)}</td>
                <td>${formatCurrency(item.tax)}</td>
                <td>${formatCurrency(item.total)}</td>
                <td>${item.paid ? 'Yes' : 'No'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'pharmacy') {
      content = `
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Quantity Sold</th>
              <th>Unit Price</th>
              <th>Total Amount</th>
              <th>Sale Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.medicineId?.name || 'N/A'}</td>
                <td>${item.medicineId?.brand || 'N/A'}</td>
                <td>${item.medicineId?.category || 'N/A'}</td>
                <td>${item.quantitySold || 0}</td>
                <td>${formatCurrency(item.unitPrice || 0)}</td>
                <td>${formatCurrency(item.totalAmount || 0)}</td>
                <td>${new Date(item.saleDate).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (reportType === 'overview') {
      content = `
        <div class="summary">
          <h3>System Overview</h3>
          <table>
            <tbody>
              <tr><td><strong>Total Patients:</strong></td><td>${formatNumber(data.patients || 0)}</td></tr>
              <tr><td><strong>Total Doctors:</strong></td><td>${formatNumber(data.doctors || 0)}</td></tr>
              <tr><td><strong>Total Appointments:</strong></td><td>${formatNumber(data.appointments || 0)}</td></tr>
              <tr><td><strong>Total Invoices:</strong></td><td>${formatNumber(data.invoices || 0)}</td></tr>
              <tr><td><strong>Total Revenue:</strong></td><td>${formatCurrency(data.revenue || 0)}</td></tr>
            </tbody>
          </table>
        </div>
      `;
    }

    return content;
  };

  const SimpleChart = ({ data, type, xKey, yKey, labelKey }) => {
    if (!data || data.length === 0) {
      return <div className="no-data">No data available</div>;
    }

    const rawMax = Math.max(...data.map(item => Number(item[yKey] || 0)));
    const maxValue = rawMax > 0 ? rawMax : 1; // avoid division by zero when all values are 0

    return (
      <div className="simple-chart">
        <div className="chart-bars">
          {data.map((item, index) => (
            <div key={index} className="chart-bar">
              <div
                className="bar"
                style={{
                  height: `${(Number(item[yKey] || 0) / maxValue) * 100}%`,
                  backgroundColor: `hsl(${index * 40}, 70%, 50%)`
                }}
              >
                <span className="bar-value">{Number(item[yKey] || 0)}</span>
              </div>
              <div className="bar-label">{item[labelKey] || item[xKey]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="analytics-card">
      <div className="analytics-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="analytics-content">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {subtitle && <small className="stat-subtitle">{subtitle}</small>}
        {trend && (
          <div className="trend-indicator">
            {trend > 0 ? <FaArrowUp className="trend-up" /> : <FaArrowDown className="trend-down" />}
            <span className={trend > 0 ? 'trend-up' : 'trend-down'}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="reports-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FaChartLine />
            Reports & Analytics
          </h1>
          <p>Comprehensive insights into hospital operations, patient data, revenue trends, and pharmacy analytics</p>
          <div className="header-stats">
            <div className="stat-item">
              <FaUsers />
              <span>{formatNumber(overallStats?.patients?.total)} Total Patients</span>
            </div>
            <div className="stat-item">
              <FaDollarSign />
              <span>{formatCurrency(overallStats?.revenue?.total)} Total Revenue</span>
            </div>
            <div className="stat-item">
              <FaPills />
              <span>{formatNumber(overallStats?.medicines?.total)} Medicines</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={() => exportToPDF()}
          >
            <FaDownload />
            Export Report
          </button>
          <button 
            className="btn-secondary"
            onClick={refreshData}
            disabled={loading}
          >
            <FaRedo />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      {console.log('Overall stats in render:', overallStats)}
      {loading ? (
        <div className="loading-section">
          <h2><FaChartPie /> Loading Analytics...</h2>
          <div className="loading-spinner">Loading data...</div>
        </div>
      ) : overallStats ? (
        <div className="analytics-section">
          <h2><FaChartPie /> Key Performance Indicators</h2>
          <div className="analytics-grid">
            <StatCard 
              title="Total Patients" 
              value={formatNumber(overallStats.patients?.total)} 
              icon={<FaUsers />} 
              color="#4CAF50"
              subtitle={`${formatNumber(overallStats.patients?.monthly)} this month`}
              trend={12}
            />
            <StatCard 
              title="Total Doctors" 
              value={formatNumber(overallStats.doctors?.total)} 
              icon={<FaUser />} 
              color="#2196F3"
              trend={5}
            />
            <StatCard 
              title="Total Appointments" 
              value={formatNumber(overallStats.appointments?.total)} 
              icon={<FaCalendar />} 
              color="#FF9800"
              subtitle={`${formatNumber(overallStats.appointments?.pending)} pending`}
              trend={8}
            />
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(overallStats.revenue?.total)} 
              icon={<FaMoneyBill />} 
              color="#9C27B0"
              subtitle={`${formatCurrency(overallStats.revenue?.monthly)} this month`}
              trend={15}
            />
            <StatCard 
              title="Total Medicines" 
              value={formatNumber(overallStats.medicines?.total)} 
              icon={<FaCapsules />} 
              color="#607D8B"
              trend={-2}
            />
            <StatCard 
              title="Low Stock Alert" 
              value={formatNumber(overallStats.medicines?.lowStock)} 
              icon={<FaExclamationTriangle />} 
              color="#F44336"
              subtitle={`${formatNumber(overallStats.medicines?.outOfStock)} out of stock`}
            />
          </div>
        </div>
      ) : (
        <div className="no-data-section">
          <h2><FaChartPie /> No Data Available</h2>
          <p>Unable to load analytics data. Please try refreshing the page.</p>
        </div>
      )}

      {/* Report Type Tabs */}
      <div className="report-tabs">
        <button 
          className={reportType === 'overview' ? 'active' : ''} 
          onClick={() => setReportType('overview')}
        >
          <FaChartPie /> Overview
        </button>
        <button 
          className={reportType === 'patients' ? 'active' : ''} 
          onClick={() => setReportType('patients')}
        >
          <FaUsers /> Patients
        </button>
        <button 
          className={reportType === 'revenue' ? 'active' : ''} 
          onClick={() => setReportType('revenue')}
        >
          <FaDollarSign /> Revenue
        </button>
        <button 
          className={reportType === 'pharmacy' ? 'active' : ''} 
          onClick={() => setReportType('pharmacy')}
        >
          <FaPills /> Pharmacy
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search reports and data..."
              disabled
            />
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filter-group">
            <FaCalendarAlt className="filter-icon" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Content */}
      <div className="reports-content">
        {reportType === 'overview' && (
          <div className="overview-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>System Overview Dashboard</h3>
                <div className="chart-actions">
                 
                  
                </div>
              </div>
              <div className="chart-content">
                <div className="overview-grid">
                  <div className="overview-item">
                    <h4>Patient Statistics</h4>
                    <div className="stat-row">
                      <span>Total Patients:</span>
                      <strong>{formatNumber(overallStats?.patients?.total || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>New This Month:</span>
                      <strong>{formatNumber(overallStats?.patients?.monthly || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Growth Rate:</span>
                      <strong className="positive">+12%</strong>
                    </div>
                  </div>
                  
                  <div className="overview-item">
                    <h4>Revenue Analysis</h4>
                    <div className="stat-row">
                      <span>Total Revenue:</span>
                      <strong>{formatCurrency(overallStats?.revenue?.total || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Monthly Revenue:</span>
                      <strong>{formatCurrency(overallStats?.revenue?.monthly || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Growth Rate:</span>
                      <strong className="positive">+15%</strong>
                    </div>
                  </div>
                  
                  <div className="overview-item">
                    <h4>Appointment Metrics</h4>
                    <div className="stat-row">
                      <span>Total Appointments:</span>
                      <strong>{formatNumber(overallStats?.appointments?.total || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Pending:</span>
                      <strong>{formatNumber(overallStats?.appointments?.pending || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Completion Rate:</span>
                      <strong className="positive">85%</strong>
                    </div>
                  </div>
                  
                  <div className="overview-item">
                    <h4>Pharmacy Status</h4>
                    <div className="stat-row">
                      <span>Total Medicines:</span>
                      <strong>{formatNumber(overallStats?.medicines?.total || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Low Stock:</span>
                      <strong className="warning">{formatNumber(overallStats?.medicines?.lowStock || 0)}</strong>
                    </div>
                    <div className="stat-row">
                      <span>Out of Stock:</span>
                      <strong className="negative">{formatNumber(overallStats?.medicines?.outOfStock || 0)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'patients' && (
          <div className="patients-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Patient Counts</h3>
                <div className="chart-actions">

                </div>
              </div>
              <div className="chart-content">
                <SimpleChart
                  data={dailyPatients}
                  type="bar"
                  xKey="date"
                  yKey="count"
                  labelKey="dayName"
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Monthly Patient Counts</h3>
              </div>
              <div className="chart-content">
                <SimpleChart
                  data={monthlyPatients}
                  type="bar"
                  xKey="month"
                  yKey="count"
                  labelKey="monthName"
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Department-wise Patient Distribution</h3>
              </div>
              <div className="chart-content">
                <div className="department-chart">
                  {departmentData.slice(0, 1).map((monthData, index) => (
                    <div key={index}>
                      <h4>{monthData.monthName}</h4>
                      <SimpleChart
                        data={monthData.departments}
                        type="bar"
                        xKey="_id"
                        yKey="count"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {reportType === 'revenue' && (
          <div className="revenue-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Revenue</h3>
                <div className="chart-actions">
                  
                </div>
              </div>
              <div className="chart-content">
                <SimpleChart
                  data={dailyRevenue}
                  type="bar"
                  xKey="date"
                  yKey="total"
                  labelKey="dayName"
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Monthly Revenue Trend</h3>
              </div>
              <div className="chart-content">
                <SimpleChart
                  data={monthlyRevenue}
                  type="bar"
                  xKey="month"
                  yKey="total"
                  labelKey="monthName"
                />
              </div>
            </div>
          </div>
        )}

        {reportType === 'pharmacy' && (
          <div className="pharmacy-section">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Daily Pharmacy Sales</h3>
                <div className="chart-actions">
                  
                </div>
              </div>
              <div className="chart-content">
                <SimpleChart
                  data={pharmacySales}
                  type="bar"
                  xKey="date"
                  yKey="totalSales"
                  labelKey="dayName"
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Selling Medicines</h3>
              </div>
              <div className="chart-content">
                <div className="top-medicines-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Quantity Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMedicines.map((medicine, index) => (
                        <tr key={index}>
                          <td>{medicine.medicineName}</td>
                          <td>{medicine.brand}</td>
                          <td>{medicine.category}</td>
                          <td>{medicine.totalQuantity}</td>
                          <td>{formatCurrency(medicine.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Low Stock & Expiring Medicines</h3>
              </div>
              <div className="chart-content">
                <div className="low-stock-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Brand</th>
                        <th>Current Stock</th>
                        <th>Min Stock</th>
                        <th>Status</th>
                        <th>Expiring Batches</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockMedicines.map((medicine, index) => (
                        <tr key={index}>
                          <td>{medicine.name}</td>
                          <td>{medicine.brand}</td>
                          <td>{medicine.currentStock}</td>
                          <td>{medicine.minimumStock}</td>
                          <td>
                            <span className={`status ${medicine.isOutOfStock ? 'out-of-stock' : medicine.isLowStock ? 'low-stock' : 'expiring'}`}>
                              {medicine.isOutOfStock ? 'Out of Stock' : medicine.isLowStock ? 'Low Stock' : 'Expiring Soon'}
                            </span>
                          </td>
                          <td>{medicine.expiringBatches.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;