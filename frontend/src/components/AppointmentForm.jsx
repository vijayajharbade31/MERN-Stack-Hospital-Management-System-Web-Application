import axios from "axios";
import { useEffect, useContext, useCallback, useMemo } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";

const AppointmentForm = () => {
  // use logged-in user info from context
  const { user } = useContext(Context);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Patient information form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Appointment-specific fields
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
  
  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error("Please enter your first name");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Please enter your last name");
      return false;
    }
    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!phone.trim()) {
      toast.error("Please enter your contact number");
      return false;
    }
    if (!validatePhone(phone)) {
      toast.error("Please enter a valid contact number (10-15 digits)");
      return false;
    }
    if (!dob) {
      toast.error("Please enter your date of birth");
      return false;
    }
    // Check if DOB is not in the future
    const birthDate = new Date(dob);
    if (birthDate > new Date()) {
      toast.error("Date of birth cannot be in the future");
      return false;
    }
    if (!gender) {
      toast.error("Please select your gender");
      return false;
    }
    if (!appointmentDate) {
      toast.error("Please select an appointment date");
      return false;
    }
    // Check if appointment date is not in the past
    const appointmentDateTime = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDateTime < today) {
      toast.error("Appointment date cannot be in the past");
      return false;
    }
    if (!appointmentTime) {
      toast.error("Please select an appointment time");
      return false;
    }
    if (!doctorFirstName || !doctorLastName) {
      toast.error("Please select a doctor");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors || []);
      } catch (error) {
        toast.error("Failed to load doctors. Please refresh the page.");
        console.error("Error fetching doctors:", error);
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // Get doctor recommendations based on symptoms
  const getRecommendations = useCallback(async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }
    
    setIsLoadingRecommendations(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/ai/recommend-doctors?symptoms=${encodeURIComponent(symptoms)}`,
        { withCredentials: true }
      );
      
      setRecommendations(data.data?.recommendations || []);
      setShowRecommendations(true);
      
      if (data.data?.suggestedDepartment) {
        setDepartment(data.data.suggestedDepartment);
        toast.success(`Recommended department: ${data.data.suggestedDepartment}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get recommendations");
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [symptoms]);

  // Memoize filtered doctors for better performance
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => doctor.doctorDepartment === department);
  }, [doctors, department]);

  // Get slot suggestions when doctor is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctorFirstName || !appointmentDate) return;
      
      const selectedDoctor = doctors.find(
        d => d.firstName === doctorFirstName && d.lastName === doctorLastName
      );
      
      if (!selectedDoctor) return;

      try {
        const [slotsRes, bookedRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/v1/ai/suggest-slots?doctorId=${selectedDoctor._id}&date=${appointmentDate}`,
            { withCredentials: true }
          ),
          axios.get(
            `http://localhost:5000/api/v1/appointment/doctor/booked?doctorId=${selectedDoctor._id}&date=${appointmentDate}`,
            { withCredentials: true }
          )
        ]);
        
        setSuggestedSlots(slotsRes.data?.data?.suggestions || []);
        setBookedSlots(bookedRes.data?.bookedSlots || []);
      } catch (error) {
        console.error("Failed to get slot suggestions:", error);
      }
    };

    fetchSlots();
  }, [doctorFirstName, doctorLastName, appointmentDate, doctors]);
  
  // Clear time when date changes
  useEffect(() => {
    setAppointmentTime("");
  }, [appointmentDate]);
  // Get minimum date for appointment (today)
  const getMinAppointmentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleAppointment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine selected local date and time into an ISO string
      const localDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      if (isNaN(localDateTime)) {
        toast.error("Invalid date/time selection");
        setIsSubmitting(false);
        return;
      }
      const appointmentIso = localDateTime.toISOString();
      
      // build payload using form values - explicitly using patient form data
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(), // Patient's email from form
        phone: phone.replace(/\D/g, ''), // Clean phone number
        dob: dob,
        gender: gender,
        appointment_date: appointmentIso,
        department,
        doctor_firstName: doctorFirstName,
        doctor_lastName: doctorLastName,
        hasVisited: Boolean(hasVisited)
      };

      // Debug: Log the payload to verify correct data is being sent
      console.log('Appointment Payload:', payload);

      const { data } = await axios.post(
        "http://localhost:5000/api/v1/appointment/post",
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      
      // Debug: Log the response to verify what was saved
      console.log('Appointment Response:', data);

      toast.success(data.message || "Appointment booked successfully!");

      // Reset all form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDob("");
      setGender("");
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
      setBookedSlots([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book appointment. Please try again.");
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common input styles
  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff',
  };

  const inputFocusStyle = {
    outline: 'none',
    borderColor: '#4F46E5',
    boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
  };

  return (
    <>
      <div className="container form-component appointment-form" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h2 className="text-center mb-8" style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '2rem' }}>Appointment</h2>
        <form onSubmit={handleAppointment} className="max-w-full">
          {/* Patient Information Form */}
          <div style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <label style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              minWidth: '180px', 
              paddingTop: '0.75rem',
              color: '#374151'
            }}>
              Patient Information
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem', 
              flex: 1,
              minWidth: '300px'
            }}>
              <input
                type="text"
                placeholder="Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="First Name"
              />
              <input
                type="text"
                placeholder="Surname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Last Name"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Email Address"
              />
              <input
                type="tel"
                placeholder="Contact"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Contact Number"
              />
            </div>
            {/* Gender Field */}
          <div style={{ marginBottom: '2rem' }}>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              style={{
                ...inputStyle,
                maxWidth: '300px',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23374151\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem'
              }}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              aria-label="Gender"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          </div>

          {/* Date Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Date of Birth"
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Appointment Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={getMinAppointmentDate()}
                required
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Appointment Date"
              />
            </div>
          </div>

          
          {/* Appointment Time Section */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
            <label style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600, 
              minWidth: '180px', 
              paddingTop: '0.75rem',
              color: '#374151'
            }}>
              Appointment Time
            </label>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: '0.5rem' }}>
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
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid #4F46E5" : "1px solid #d1d5db",
                        background: isBooked ? "#FEE2E2" : (isSelected ? "#EEF2FF" : "#ffffff"),
                        color: isBooked ? "#991B1B" : "#111827",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        minWidth: "75px",
                        fontWeight: isSelected ? 700 : 500,
                        transition: 'all 0.2s ease',
                        fontSize: '0.95rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.target.style.background = '#f9fafb';
                          e.target.style.borderColor = '#9ca3af';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled && !isSelected) {
                          e.target.style.background = '#ffffff';
                          e.target.style.borderColor = '#d1d5db';
                        }
                      }}
                      aria-label={`Time slot ${value}${isBooked ? ' - Booked' : ''}`}
                    >
                      {isBooked ? `${value} (Booked)` : (typeof slot === "string" ? value : (slot.label || value))}
                    </button>
                  );
                })}
              </div>
              {!appointmentTime && appointmentDate && doctorFirstName && (
                <p style={{ color: "#6b7280", marginTop: "8px", fontSize: '0.875rem' }}>
                  Select a time slot above.
                </p>
              )}
              {!appointmentDate && (
                <p style={{ color: "#9ca3af", marginTop: "8px", fontSize: '0.875rem' }}>
                  Please select an appointment date and doctor first.
                </p>
              )}
            </div>
          </div>

          {/* Symptoms Input */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <textarea
                placeholder="Describe your symptoms (optional)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  minHeight: '100px'
                }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Symptoms Description"
              />
            </div>
            <button
              type="button"
              onClick={getRecommendations}
              disabled={isLoadingRecommendations || !symptoms.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                background: isLoadingRecommendations 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoadingRecommendations || !symptoms.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                height: 'fit-content',
                whiteSpace: 'nowrap',
                boxShadow: isLoadingRecommendations || !symptoms.trim() 
                  ? 'none' 
                  : '0 2px 4px rgba(76, 175, 80, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!isLoadingRecommendations && symptoms.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoadingRecommendations && symptoms.trim()) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(76, 175, 80, 0.2)';
                }
              }}
              aria-label="Get AI Recommendations"
            >
              {isLoadingRecommendations ? 'Loading...' : 'Get AI Recommendations'}
            </button>
          </div>

          {/* Doctor Recommendations Display */}
          {showRecommendations && recommendations.length > 0 && (
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f7fa 100%)',
              borderRadius: '12px',
              marginBottom: '2rem',
              border: '1px solid #bfdbfe'
            }}>
              <h3 style={{ 
                color: '#0077B6', 
                marginBottom: '1rem',
                fontSize: '1.125rem',
                fontWeight: 600
              }}>
                Recommended Doctors:
              </h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {recommendations.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDoctorFirstName(doc.firstName);
                      setDoctorLastName(doc.lastName);
                      setDepartment(doc.doctorDepartment || department);
                      setShowRecommendations(false);
                      toast.success(`Selected Dr. ${doc.firstName} ${doc.lastName}`);
                    }}
                    style={{
                      padding: '1rem',
                      background: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '2px solid #0077B6',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 119, 182, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0, 119, 182, 0.2)';
                      e.target.style.borderColor = '#005f8a';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0, 119, 182, 0.1)';
                      e.target.style.borderColor = '#0077B6';
                    }}
                    aria-label={`Select doctor ${doc.firstName} ${doc.lastName}`}
                  >
                    <strong style={{ fontSize: '1rem', color: '#1f2937' }}>
                      Dr. {doc.firstName} {doc.lastName}
                    </strong>
                    <br />
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      {doc.doctorDepartment || department}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Department and Doctor Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Department
              </label>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setDoctorFirstName("");
                  setDoctorLastName("");
                  setAppointmentTime("");
                }}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23374151\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Department"
              >
                {departmentsArray.map((depart, index) => (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Select Doctor
              </label>
              <select
                value={JSON.stringify({
                  firstName: doctorFirstName,
                  lastName: doctorLastName,
                })}
                onChange={(e) => {
                  const { firstName, lastName } = JSON.parse(e.target.value);
                  setDoctorFirstName(firstName);
                  setDoctorLastName(lastName);
                  setAppointmentTime("");
                }}
                disabled={!department || isLoadingDoctors}
                style={{
                  ...inputStyle,
                  cursor: !department || isLoadingDoctors ? 'not-allowed' : 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23374151\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem',
                  opacity: !department || isLoadingDoctors ? 0.6 : 1
                }}
                onFocus={(e) => !department || isLoadingDoctors ? null : Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                aria-label="Select Doctor"
              >
                <option value={JSON.stringify({ firstName: "", lastName: "" })}>
                  {isLoadingDoctors ? 'Loading doctors...' : 'Select Doctor'}
                </option>
                {filteredDoctors.map((doctor, index) => (
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
          </div>

          {/* Recommended slots section removed to avoid duplicate time inputs */}

          {/* Previous Visit Checkbox */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "2px", 
            marginBottom: '2rem',
            marginLeft: '100px',
            justifyContent: "flex-end"
          }}>
            <label 
              htmlFor="hasVisited"
              style={{ 
                margin: 0,
                padding: 0,
                marginBottom: 0, 
                marginRight: 0,
                cursor: "pointer",
                fontSize: '0.95rem',
                color: '#374151',
                userSelect: 'none'
              }}
            >
              Have you visited before?
            </label>
            <input
              id="hasVisited"
              type="checkbox"
              checked={hasVisited}
              onChange={(e) => setHasVisited(e.target.checked)}
              style={{ 
                width: "20px", 
                height: "20px", 
                margin: 0,
                padding: 0,
                cursor: "pointer",
                accentColor: '#4F46E5',
                flexShrink: 0
              }}
              aria-label="Have you visited before"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{ 
              margin: "0 auto", 
              display: "block", 
              width: "fit-content",
              padding: "0.875rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: "bold",
              background: isSubmitting 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: isSubmitting ? 'not-allowed' : "pointer",
              transition: 'all 0.3s ease',
              boxShadow: isSubmitting 
                ? 'none' 
                : '0 4px 12px rgba(124, 58, 237, 0.3)',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
              }
            }}
            aria-label="Submit Appointment"
          >
            {isSubmitting ? 'Booking...' : 'GET APPOINTMENT'}
          </button>
        </form>
      </div>
    </>
  );
};

export default AppointmentForm;
