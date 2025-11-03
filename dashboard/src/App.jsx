import { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import DoctorDetails from "./components/DoctorDetails";
import EditDoctor from "./components/EditDoctor";
import InvoiceManagement from "./components/InvoiceManagement";
import MedicineManagement from "./components/MedicineManagement";
import Reports from "./components/Reports";
import { Context } from "./main";
import axios from "./utils/api";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";
import "./components/MedicineManagement.css";
import "./components/Reports.css";
import "./components/InvoiceManagement.css";

const App = () => {
  const { setIsAuthenticated, setAdmin } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/user/admin/me",
          {
            withCredentials: true,
          }
        );
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch (error) {
        console.log('Authentication check failed:', error.message);
        setIsAuthenticated(false);
        setAdmin({});
      }
    };
    
    // Add a small delay to prevent immediate API call
    const timer = setTimeout(() => {
      fetchUser();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [setIsAuthenticated, setAdmin]);

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor/addnew" element={<AddNewDoctor />} />
          <Route path="/doctor/:id" element={<DoctorDetails />} />
          <Route path="/doctor/:id/edit" element={<EditDoctor />} />
          <Route path="/admin/addnew" element={<AddNewAdmin />} />
          <Route path="/invoices" element={<InvoiceManagement />} />
          <Route path="/medicines" element={<MedicineManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/doctors" element={<Doctors />} />
        </Routes>
        <ToastContainer position="top-center" />
      </div>
    </Router>
  );
};

export default App;
