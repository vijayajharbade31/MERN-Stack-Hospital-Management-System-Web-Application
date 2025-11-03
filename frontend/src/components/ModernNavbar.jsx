import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";

/**
 * Modern Navbar Component
 * Features:
 * - Sticky positioning with shadow effect
 * - Clean white background
 * - Responsive hamburger menu for mobile
 * - Smooth animations
 * - Healthcare color scheme (#0077B6 primary)
 */
const ModernNavbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    await axios
      .get("http://localhost:5000/api/v1/user/patient/logout", {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const goToLogin = () => {
    navigateTo("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-300 border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.png" alt="ClinIQ Logo" className="h-12 w-auto" />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-semibold tracking-wide relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/appointment"
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-semibold tracking-wide relative group"
            >
              Appointment
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-semibold tracking-wide relative group"
            >
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/record"
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-semibold tracking-wide relative group"
            >
              Records
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={goToLogin}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-[#005f94] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setShow(!show)}
          >
            {show ? <IoMdClose /> : <GiHamburgerMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            show ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setShow(false)}
              className="block text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/appointment"
              onClick={() => setShow(false)}
              className="block text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              Appointment
            </Link>
            <Link
              to="/about"
              onClick={() => setShow(false)}
              className="block text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              to="/record"
              onClick={() => setShow(false)}
              className="block text-gray-700 hover:text-primary font-medium transition-colors duration-200"
            >
              Records
            </Link>
            <div className="pt-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={goToLogin}
                  className="w-full px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-[#005f94] transition-all duration-300"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavbar;
