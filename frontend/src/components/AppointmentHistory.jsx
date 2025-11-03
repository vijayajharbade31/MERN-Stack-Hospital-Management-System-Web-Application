import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";
import "./AppointmentHistory.css";
import axios from "../utils/api";
import { FaCalendarAlt, FaUserMd, FaClock, FaFileInvoiceDollar, FaSearch, FaFilter } from "react-icons/fa";
import { MdDateRange, MdLocationOn } from "react-icons/md";

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [expandedBilling, setExpandedBilling] = useState({});
  const { isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  const handleGenerateInvoice = (appointmentId) => {
    navigate(`/create-invoice/${appointmentId}`);
  };

  const toggleBillingSummary = (appointmentId) => {
    setExpandedBilling(prev => ({
      ...prev,
      [appointmentId]: !prev[appointmentId]
    }));
  };

  // Find invoice for a given appointment, handling populated or raw ObjectId
  const findInvoiceByAppointmentId = useCallback((appointmentId) => {
    return invoices.find((inv) => {
      const invApt = inv.appointmentId;
      const invAptId = typeof invApt === "object" ? invApt?._id : invApt;
      return String(invAptId || "") === String(appointmentId || "");
    });
  }, [invoices]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [appointmentsRes, invoicesRes] = await Promise.all([
        axios.get("/appointment/patient/appointments", {
          withCredentials: true
        }),
        axios.get("/invoice/patient", {
          withCredentials: true
        })
      ]);
      
      if (appointmentsRes.data.success) {
        setAppointments(appointmentsRes.data.appointments || []);
      }
      
      if (invoicesRes.data.success) {
        setInvoices(invoicesRes.data.invoices || []);
      }
    } catch (error) {
      console.error("Data fetch error:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch records");
      }
      // Set empty arrays as fallback
      setAppointments([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterAppointments = useCallback(() => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter(appointment =>
        (appointment.doctorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (appointment.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (appointment.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (appointment.symptoms?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(appointment => 
        appointment.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(appointment => {
        try {
          const appointmentDate = new Date(appointment.appointment_date || appointment.date);
          if (isNaN(appointmentDate.getTime())) return false;
          
          switch (dateFilter) {
            case "today":
              return appointmentDate.toDateString() === today.toDateString();
            case "week": {
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return appointmentDate >= weekAgo;
            }
            case "month": {
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return appointmentDate >= monthAgo;
            }
            case "upcoming":
              return appointmentDate >= today;
            case "past":
              return appointmentDate < today;
            default:
              return true;
          }
        } catch (error) {
          console.error("Date filtering error:", error);
          return false;
        }
      });
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, navigate, fetchData]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, statusFilter, dateFilter, filterAppointments]);

  const completedAppointments = useMemo(() => appointments.filter(apt => 
    apt.status?.toLowerCase() === "completed" || 
    apt.status?.toLowerCase() === "accepted"
  ), [appointments]);

  const upcomingAppointments = useMemo(() => appointments.filter(apt => 
    apt.status?.toLowerCase() === "pending"
  ), [appointments]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "accepted":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "accepted":
        return "✓";
      case "pending":
        return "⏳";
      case "rejected":
        return "✗";
      default:
        return "?";
    }
  };

  const renderInvoiceSummary = (invoice) => {
    const patientName = invoice.patientName || (invoice.patientId ? `${invoice.patientId.firstName} ${invoice.patientId.lastName}` : "");
    const email = invoice.email || invoice.patientId?.email || "";
    return (
    <div className="billingSummary">
      <div className="billingSummaryHeader">
        <div className="patientInfo">
          <h6>Patient</h6>
          <p>{patientName}</p>
          <p className="email">{email}</p>
        </div>
        <div className="invoiceInfo">
          <h6>Date Created</h6>
          <p>{new Date(invoice.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}</p>
          <div className="statusBadge">
            <span className={`status ${invoice.paid ? 'paid' : 'pending'}`}>
              {invoice.paid ? 'Paid' : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      <div className="invoiceItems">
        <h6>Invoice Items</h6>
        <div className="itemsList">
          {invoice.items.map((item, index) => (
            <div key={index} className="invoiceItem">
              <div className="itemType">ITEM</div>
              <div className="itemDetails">
                <span className="itemName">{item.description}</span>
                <div className="itemNumbers">
                  <span>{item.qty}</span>
                  <span>₹{item.unitPrice}</span>
                  <span className="itemTotal">₹{item.total}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="invoiceSummary">
          <div className="summaryRow">
            <span>Subtotal:</span>
            <span>₹{invoice.items.reduce((sum, item) => sum + item.total, 0)}</span>
          </div>
          <div className="summaryRow">
            <span>Consulting Fees:</span>
            <span>₹{invoice.tax || 0}</span>
          </div>
          <div className="summaryRow total">
            <span>Total:</span>
            <span>₹{invoice.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
  }

  if (loading) {
    return (
      <div className="recordSection">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your appointment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recordSection">
      <div className="recordHeader">
        <div className="headerContent">
          <h1><FaCalendarAlt /> My Appointment History</h1>
          <p>Track and manage all your medical appointments and invoices</p>
        </div>
      </div>

      <div className="appointmentStats">
        <div className="statBox total">
          <div className="statIcon">
            <FaCalendarAlt />
          </div>
          <div className="statContent">
            <h3>Total Appointments</h3>
            <p>{appointments.length}</p>
          </div>
        </div>
        <div className="statBox completed">
          <div className="statIcon">
            <FaUserMd />
          </div>
          <div className="statContent">
            <h3>Completed</h3>
            <p>{completedAppointments.length}</p>
          </div>
        </div>
        <div className="statBox upcoming">
          <div className="statIcon">
            <FaClock />
          </div>
          <div className="statContent">
            <h3>Upcoming</h3>
            <p>{upcomingAppointments.length}</p>
          </div>
        </div>
        <div className="statBox invoices">
          <div className="statIcon">
            <FaFileInvoiceDollar />
          </div>
          <div className="statContent">
            <h3>Invoices</h3>
            <p>{invoices.length}</p>
          </div>
        </div>
      </div>

      <div className="searchFilterSection">
        <div className="searchBar">
          <FaSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search by doctor, department, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filterControls">
          <div className="filterGroup">
            <FaFilter className="filterIcon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filterGroup">
            <MdDateRange className="filterIcon" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      <div className="appointmentHistory">
        <div className="sectionHeader">
          <h2><FaCalendarAlt /> Appointment Details</h2>
          <span className="resultCount">{filteredAppointments.length} appointments found</span>
        </div>
        
        {filteredAppointments.length === 0 ? (
          <div className="emptyState">
            <FaCalendarAlt className="emptyIcon" />
            <h3>No appointments found</h3>
            <p>Try adjusting your search criteria or book a new appointment.</p>
          </div>
        ) : (
          <div className="appointmentList">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className={`appointmentCard ${appointment.status?.toLowerCase()}`}>
                <div className="appointmentHeader">
                  <div className="doctorInfo">
                    <div className="doctorAvatar">
                      <FaUserMd />
                    </div>
                    <div className="doctorDetails">
                      <h4>Dr. {(() => {
                        if (appointment.doctorName) return appointment.doctorName;
                        if (appointment.doctorFirstName && appointment.doctorLastName) 
                          return `${appointment.doctorFirstName} ${appointment.doctorLastName}`;
                        if (appointment.doctor?.firstName && appointment.doctor?.lastName)
                          return `${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
                        return "Unknown";
                      })()}</h4>
                      <p className="patientName">
                        Patient: {appointment.patientName || "Not specified"}
                      </p>
                      <p className="department">
                        <MdLocationOn /> {appointment.department || "General Medicine"}
                      </p>
                    </div>
                  </div>
                  <div className="headerActions">
                    {appointment.status?.toLowerCase() === "completed" && !invoices.some(inv => inv.appointmentId === appointment._id) && (
                      <button 
                        onClick={() => navigate(`/create-invoice/${appointment._id}`)} 
                        className="generateInvoiceBtn"
                      >
                        <FaFileInvoiceDollar /> Generate Invoice
                      </button>
                    )}
                    <div className="statusBadge" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                      <span className="statusIcon">{getStatusIcon(appointment.status)}</span>
                      <span className="statusText">{appointment.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="appointmentDetails">
                  <div className="detailRow">
                    <div className="detailItem">
                      <FaCalendarAlt className="detailIcon" />
                      <div>
                        <span className="detailLabel">Date</span>
                        <span className="detailValue">
                          {(() => {
                            try {
                              const dateStr = appointment.appointment_date || appointment.date;
                              if (!dateStr) return "Date not available";
                              return new Date(dateStr).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            } catch (error) {
                              console.error("Date parsing error:", error);
                              return "Invalid date";
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="detailItem">
                      <FaClock className="detailIcon" />
                      <div>
                        <span className="detailLabel">Time</span>
                        <span className="detailValue">
                          {appointment.slot || new Date(appointment.appointment_date || appointment.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="billingHistorySection">
                    <button 
                      className={`billing-summary-toggle ${expandedBilling[appointment._id] ? 'expanded' : ''}`}
                      onClick={() => toggleBillingSummary(appointment._id)}
                    >
                      <div className="toggle-header">
                        <FaFileInvoiceDollar /> Billing Summary
                      </div>
                      <span className="toggle-icon">
                        {expandedBilling[appointment._id] ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    <div className={`billing-content ${expandedBilling[appointment._id] ? 'show' : ''}`}>
                      {findInvoiceByAppointmentId(appointment._id) ? (
                        <div className="billingDetails">
                          {renderInvoiceSummary(findInvoiceByAppointmentId(appointment._id))}
                        </div>
                      ) : (
                        appointment.status?.toLowerCase() === "completed" && (
                          <div className="generateInvoicePrompt">
                            <p>No invoice generated yet</p>
                            <button
                              onClick={() => navigate(`/create-invoice/${appointment._id}`)}
                              className="generateInvoiceBtn"
                            >
                              <FaFileInvoiceDollar /> Generate Invoice
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {appointment.symptoms && (
                    <div className="symptomsSection">
                      <h5>Symptoms</h5>
                      <p>{appointment.symptoms}</p>
                    </div>
                  )}
                  
                  {appointment.notes && (
                    <div className="notesSection">
                      <h5>Notes</h5>
                      <p>{appointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Summary section removed as requested */}
    </div>
  );
};

export default AppointmentHistory;