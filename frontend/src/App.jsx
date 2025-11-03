import DoctorForm from "./components/DoctorForm";
import PatientProfile from "./components/PatientProfile";
import AppointmentHistory from "./components/AppointmentHistory";
import CreateInvoice from "./components/CreateInvoice";
import { useContext, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Register from "./Pages/Register";
import ModernFooter from "./components/ModernFooter";
import ModernNavbar from "./components/ModernNavbar";
import Chatbot from "./components/Chatbot";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "./utils/api";
import PatientList from "./components/PatientList";
import DoctorList from "./components/DoctorList";
import { Context } from "./main";
import Login from "./Pages/Login";
import MedicineList from "./components/MedicineList";
import InvoiceList from "./components/InvoiceList";
import Reports from "./Pages/Reports";
const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/user/patient/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setUser(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setUser({});
      }
    };
    fetchUser();
  }, [isAuthenticated, setIsAuthenticated, setUser]);

  return (
    <>
      <Router>
        <ModernNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patients" element={<PatientList />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctor/addnew" element={<DoctorForm />} />
          <Route path="/patient/:patientId" element={<PatientProfile />} />
          <Route path="/medicines" element={<MedicineList />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/record" element={<AppointmentHistory />} />
          <Route path="/create-invoice/:appointmentId" element={<CreateInvoice />} />
        </Routes>
        <ModernFooter />
        <Chatbot />
        <ToastContainer position="top-center" />
      </Router>
    </>
  );
};

export default App;
