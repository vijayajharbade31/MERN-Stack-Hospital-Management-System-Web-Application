import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/api';
import { FaPlus, FaMinus, FaArrowLeft } from 'react-icons/fa';

const CreateInvoice = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [items, setItems] = useState([{ description: '', qty: 1, unitPrice: 0 }]);
  const [tax, setTax] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(appointmentId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, medicinesRes, invoicesRes] = await Promise.all([
          axios.get('/appointment/patient/appointments', { withCredentials: true }),
          axios.get('/medicine/list'),
          axios.get('/invoice/patient', { withCredentials: true })
        ]);

        if (appointmentsRes.data.success) {
          // Get completed appointments that don't have invoices
          const completedAppointments = appointmentsRes.data.appointments
            .filter(apt => apt.status.toLowerCase() === 'completed');

          if (invoicesRes.data.success) {
            const invoicedAppointmentIds = invoicesRes.data.invoices.map(inv => inv.appointmentId);
            const appointmentsWithoutInvoices = completedAppointments
              .filter(apt => !invoicedAppointmentIds.includes(apt._id))
              .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
            setAppointments(appointmentsWithoutInvoices);
          } else {
            const sortedAppointments = completedAppointments
              .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
            setAppointments(sortedAppointments);
          }
        }

        if (medicinesRes.data.success) {
          setMedicines(medicinesRes.data.medicines);
        }

        if (selectedAppointmentId) {
          const appointmentRes = await axios.get(`/appointment/${selectedAppointmentId}`);
          if (appointmentRes.data.success) {
            const fetchedAppointment = appointmentRes.data.appointment;
            setAppointment(fetchedAppointment);
            
            // Add default consultation fee item when appointment is selected
            const defaultConsultationFee = 500; // Default fee, you can adjust this
            setItems([{
              description: 'Consultation Fee',
              qty: 1,
              unitPrice: defaultConsultationFee,
              total: defaultConsultationFee
            }]);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch data');
        navigate(-1);
      }
    };

    fetchData();
  }, [selectedAppointmentId, navigate]);

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // If medicine is selected, update price
    if (field === 'description') {
      const medicine = medicines.find(m => m.name === value);
      if (medicine) {
        newItems[index].unitPrice = medicine.price || 0;
        newItems[index].medicineId = medicine._id;
      }
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    return (subtotal + Number(tax)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.some(item => !item.description || item.qty <= 0)) {
      toast.error('Please fill all item details correctly');
      return;
    }

    try {
      const payload = {
        patientId: appointment.patientId,
        appointmentId,
        items: items.map(item => ({
          ...item,
          total: item.qty * item.unitPrice
        })),
        tax: Number(tax)
      };

      const { data } = await axios.post('/invoice/create', payload);
      
      if (data.success) {
        toast.success('Invoice created successfully');
        navigate(-1);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="createInvoice">
      <div className="header">
        <button onClick={() => navigate(-1)} className="backButton">
          <FaArrowLeft /> Back
        </button>
        <h2>Create Invoice for Appointment</h2>
      </div>

      {!appointmentId && (
        <div className="appointmentSelector">
          <h3>Select Appointment</h3>
          <div className="appointmentButtons">
            {appointments.map((apt) => (
              <button
                key={apt._id}
                type="button"
                className={`appointmentButton ${apt._id === selectedAppointmentId ? 'selected' : ''}`}
                onClick={() => setSelectedAppointmentId(apt._id)}
              >
                <div className="aptInfo">
                  <div className="doctorInfo">
                    <span className="doctorName">
                      Dr. {apt.doctorName || `${apt.doctor?.firstName} ${apt.doctor?.lastName}`}
                    </span>
                    <span className="department">{apt.department}</span>
                  </div>
                  <div className="timeInfo">
                    <span className="aptDate">
                      {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="aptTime">
                      {apt.slot || new Date(apt.appointment_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {appointment && (
        <>
          <div className="appointmentInfo">
            <h3>Appointment Details</h3>
            <p>Patient: {appointment.firstName} {appointment.lastName}</p>
            <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
            <p>Doctor: Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</p>
            <p>Department: {appointment.department}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="itemsList">
              <h3>Items</h3>
              {items.map((item, index) => (
                <div key={index} className="itemRow">
                  <select
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  >
                    <option value="">Select Item/Medicine</option>
                    <optgroup label="Consultation">
                      <option value="Consultation Fee">Consultation Fee</option>
                      <option value="Follow-up Visit">Follow-up Visit</option>
                    </optgroup>
                    <optgroup label="Medicines">
                      {medicines.map((medicine) => (
                        <option key={medicine._id} value={medicine.name}>
                          {medicine.name} (₹{medicine.price})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                    required
                  />
                  
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    required
                  />
                  
                  <span className="itemTotal">
                    ₹{(item.qty * item.unitPrice).toFixed(2)}
                  </span>
                  
                  {items.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="removeItem"
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" onClick={addItem} className="addItem">
                <FaPlus /> Add Item
              </button>
            </div>

            <div className="totalsSection">
              <div className="taxField">
                <label>Tax Amount:</label>
                <input
                  type="number"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                />
              </div>
              
              <div className="totalAmount">
                <h4>Total Amount: ₹{calculateTotal()}</h4>
              </div>
            </div>

            <div className="formActions">
              <button type="submit" className="submitButton">
                Create Invoice
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateInvoice;