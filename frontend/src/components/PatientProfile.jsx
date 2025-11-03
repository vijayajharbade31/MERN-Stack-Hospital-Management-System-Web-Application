import { useEffect, useState } from "react";
import axios from "../utils/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const PatientProfile = () => {
  const { patientId } = useParams();
  const [profile, setProfile] = useState(null);
  const [visits, setVisits] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        
        // Fetch patient record
        const recordResponse = await axios.get(`/patient-record/${patientId}`);
        setProfile(recordResponse.data.profile || {});
        setVisits(recordResponse.data.visits || []);
        
        // Fetch invoices for this patient
        const invoiceResponse = await axios.get(`/invoice/patient/${patientId}`);
        setInvoices(invoiceResponse.data.invoices || []);
        
      } catch (err) {
        toast.error(err?.message || "Failed to load patient profile");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [patientId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Patient not found</div>;

  return (
    <div className="page container">
      <h3>Patient Profile</h3>
      <div className="profile-section">
        <h4>Personal Information</h4>
        <div className="profile-info">
          <strong>Name:</strong> {profile.firstName} {profile.lastName}<br />
          <strong>Email:</strong> {profile.email}<br />
          <strong>Phone:</strong> {profile.phone}<br />
          <strong>DOB:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : "-"}<br />
        </div>
      </div>

      <div className="visits-section">
        <h4>Visit History</h4>
        {visits.length === 0 ? (
          <p>No visits found</p>
        ) : (
          <div className="visits-list">
            {visits.map((v, i) => (
              <div key={i} className="visit-item">
                <div className="visit-date">
                  {v.date ? new Date(v.date).toLocaleString() : "-"}
                </div>
                <div className="visit-details">
                  <strong>Reason:</strong> {v.reason || "-"}<br />
                  {v.notes && <><strong>Notes:</strong> {v.notes}<br /></>}
                  {v.diagnoses && v.diagnoses.length > 0 && (
                    <><strong>Diagnoses:</strong> {v.diagnoses.join(", ")}<br /></>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="invoices-section">
        <h4>Invoice History</h4>
        {invoices.length === 0 ? (
          <p>No invoices found</p>
        ) : (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Appointment</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td>
                      {invoice.items.map((item, index) => (
                        <div key={index} className="invoice-item">
                          {item.description} (Qty: {item.qty})
                        </div>
                      ))}
                    </td>
                    <td>{formatCurrency(invoice.total)}</td>
                    <td>
                      <span className={`status ${invoice.paid ? 'paid' : 'pending'}`}>
                        {invoice.paid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {invoice.appointmentId ? (
                        <div>
                          {new Date(invoice.appointmentId.appointment_date).toLocaleDateString()}
                          <br />
                          <small>{invoice.appointmentId.department}</small>
                        </div>
                      ) : (
                        'No appointment linked'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
