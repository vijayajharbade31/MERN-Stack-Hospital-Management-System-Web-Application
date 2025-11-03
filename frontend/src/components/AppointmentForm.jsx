import axios from "axios";
import { useEffect, useContext } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";

const AppointmentForm = () => {
  // use logged-in user info from context
  const { user } = useContext(Context);

  // patient fields are taken from user object; local state only for appointment-specific fields
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  
  // AI Features
  const [symptoms, setSymptoms] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const defaultSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
  ];

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/user/doctors",
        { withCredentials: true }
      );
      setDoctors(data.doctors);
      console.log(data.doctors);
    };
    fetchDoctors();
  }, []);

  // Get doctor recommendations based on symptoms
  const getRecommendations = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }
    
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/ai/recommend-doctors?symptoms=${encodeURIComponent(symptoms)}`,
        { withCredentials: true }
      );
      
      setRecommendations(data.data.recommendations || []);
      setShowRecommendations(true);
      
      if (data.data.suggestedDepartment) {
        setDepartment(data.data.suggestedDepartment);
        toast.success(`Recommended department: ${data.data.suggestedDepartment}`);
      }
    } catch (error) {
      toast.error("Failed to get recommendations");
    }
  };

  // Get slot suggestions when doctor is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorFirstName || !appointmentDate) return;
      
      const selectedDoctor = doctors.find(
        d => d.firstName === doctorFirstName && d.lastName === doctorLastName
      );
      
      if (!selectedDoctor) return;

      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/ai/suggest-slots?doctorId=${selectedDoctor._id}&date=${appointmentDate}`,
          { withCredentials: true }
        );
        setSuggestedSlots(data.data.suggestions || []);
        // Fetch booked slots for the selected doctor/date
        const bookedRes = await axios.get(
          `http://localhost:5000/api/v1/appointment/doctor/booked?doctorId=${selectedDoctor._id}&date=${appointmentDate}`
        );
        setBookedSlots(bookedRes.data.bookedSlots || []);
      } catch (error) {
        console.error("Failed to get slot suggestions");
      }
    };

    fetchSlots();
  }, [doctorFirstName, doctorLastName, appointmentDate, doctors]);
  
  // Clear time when date changes
  useEffect(() => {
    setAppointmentTime("");
  }, [appointmentDate]);
  const handleAppointment = async (e) => {
    e.preventDefault();

    // Ensure user is logged in
    if (!user) {
      toast.error("Please login to book an appointment");
      return;
    }

    // Validate appointment fields
    if (!appointmentDate) {
      toast.error("Please select an appointment date");
      return;
    }
    if (!appointmentTime) {
      toast.error("Please select an appointment time");
      return;
    }
    if (!doctorFirstName || !doctorLastName) {
      toast.error("Please select a doctor");
      return;
    }

    try {
      // Combine selected local date and time into an ISO string
      const localDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      if (isNaN(localDateTime)) {
        toast.error("Invalid date/time selection");
        return;
      }
      const appointmentIso = localDateTime.toISOString();
      const hasVisitedBool = Boolean(hasVisited);
      // build payload using logged-in user info
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        appointment_date: appointmentIso,
        department,
        doctor_firstName: doctorFirstName,
        doctor_lastName: doctorLastName,
        hasVisited: hasVisitedBool
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/v1/appointment/post",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success(data.message);

      // Reset only appointment-specific fields
      setAppointmentDate("");
      setDepartment("Pediatrics");
      setAppointmentTime("");
      setDoctorFirstName("");
      setDoctorLastName("");
      setHasVisited(false);
      setSymptoms("");
      setRecommendations([]);
      setShowRecommendations(false);
      setSuggestedSlots([]);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <>
      <div className="container form-component appointment-form" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h2 className="text-center mb-8">Appointment</h2>
        <form onSubmit={handleAppointment} className="max-w-full">
          {user ? (
            <div style={{ marginBottom: '1rem' }}>
              <div>Booking as: <strong>{user.firstName} {user.lastName}</strong></div>
              <div><small>{user.email}</small></div>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <p>Please login to autofill your details, or sign up to create an account.</p>
            </div>
          )}

          <div>
            <input
              type="date"
              placeholder="Appointment Date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </div>
          <div>
            {/* Time Slots Selector */}
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>Appointment Time</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {(suggestedSlots.length ? suggestedSlots : defaultSlots).map((slot, idx) => {
                  const value = typeof slot === "string" ? slot : slot.time || "";
                  const isSelected = appointmentTime === value;
                  const isBooked = bookedSlots.includes(value);
                  const isDisabled = !appointmentDate || !doctorFirstName || !doctorLastName || isBooked;
                  return (
                    <button
                      key={`${value}-${idx}`}
                      type="button"
                      onClick={() => !isDisabled && setAppointmentTime(value)}
                      disabled={isDisabled}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid #4F46E5" : "1px solid #d1d5db",
                        background: isBooked ? "#FEE2E2" : (isSelected ? "#EEF2FF" : "#ffffff"),
                        color: isBooked ? "#991B1B" : "#111827",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        minWidth: "70px",
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {isBooked ? `${value} (Booked)` : (typeof slot === "string" ? value : (slot.label || value))}
                    </button>
                  );
                })}
              </div>
              {!appointmentTime && appointmentDate && doctorFirstName && (
                <p style={{ color: "#6b7280", marginTop: "8px" }}>Select a time slot above.</p>
              )}
            </div>
          </div>

          {/* Symptoms Input */}
          <div>
            <input
              type="text"
              placeholder="Describe your symptoms (optional)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <button
              type="button"
              onClick={getRecommendations}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Get AI Recommendations
            </button>
          </div>

          {/* Doctor Recommendations Display */}
          {showRecommendations && recommendations.length > 0 && (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <h3 style={{ color: '#0077B6', marginBottom: '1rem' }}>Recommended Doctors:</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {recommendations.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDoctorFirstName(doc.firstName);
                      setDoctorLastName(doc.lastName);
                      setShowRecommendations(false);
                    }}
                    style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '2px solid #0077B6',
                      transition: 'all 0.3s'
                    }}
                  >
                    <strong>{doc.firstName} {doc.lastName}</strong>
                    <br />
                    <span style={{ color: '#666' }}>{doc.doctorDepartment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setDoctorFirstName("");
                setDoctorLastName("");
              }}
            >
              {departmentsArray.map((depart, index) => {
                return (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                );
              })}
            </select>
            {/* <select
              value={`${doctorFirstName} ${doctorLastName}`}
              onChange={(e) => {
                const [firstName, lastName] = e.target.value.split(" ");
                setDoctorFirstName(firstName);
                setDoctorLastName(lastName);
              }}
              disabled={!department}
            >
              <option value="">Select Doctor</option>
              {doctors
                .filter((doctor) => doctor.doctorDepartment === department)
                .map((doctor, index) => (
                  <option
                    value={`${doctor.firstName} ${doctor.lastName}`}
                    key={index}
                  >
                    {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
            </select> */}
            <select
              value={JSON.stringify({
                firstName: doctorFirstName,
                lastName: doctorLastName,
              })}
              onChange={(e) => {
                const { firstName, lastName } = JSON.parse(e.target.value);
                setDoctorFirstName(firstName);
                setDoctorLastName(lastName);
              }}
              disabled={!department}
            >
              <option value="">Select Doctor</option>
              {doctors
                .filter((doctor) => doctor.doctorDepartment === department)
                .map((doctor, index) => (
                  <option
                    key={index}
                    value={JSON.stringify({
                      firstName: doctor.firstName,
                      lastName: doctor.lastName,
                    })}
              >
                {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
            </select>
          </div>

          {/* Recommended slots section removed to avoid duplicate time inputs */}

          {/* Address removed - using logged-in user address where available */}
          <div
            style={{
              gap: "10px",
              justifyContent: "flex-end",
              flexDirection: "row",
            }}
          >
            <p style={{ marginBottom: 0 }}>Have you visited before?</p>
            <input
              type="checkbox"
              checked={hasVisited}
              onChange={(e) => setHasVisited(e.target.checked)}
              style={{ flex: "none", width: "25px" }}
            />
          </div>
          <button style={{ margin: "0 auto", display: "block", width: "fit-content" }}>GET APPOINTMENT</button>
        </form>
      </div>
    </>
  );
};

export default AppointmentForm;
