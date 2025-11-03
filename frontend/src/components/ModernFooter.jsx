import { Link } from "react-router-dom";
import { FaLocationDot, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";

/**
 * Modern Footer Component
 * Features:
 * - Dark blue background (#0077B6)
 * - Contact information
 * - Quick links
 * - Social media icons
 * - Responsive grid layout
 */
const ModernFooter = () => {
  const hours = [
    { day: "Monday", time: "9:00 AM - 11:00 PM" },
    { day: "Tuesday", time: "12:00 PM - 12:00 AM" },
    { day: "Wednesday", time: "10:00 AM - 10:00 PM" },
    { day: "Thursday", time: "9:00 AM - 9:00 PM" },
    { day: "Friday", time: "3:00 PM - 9:00 PM" },
    { day: "Saturday", time: "9:00 AM - 3:00 PM" },
  ];

  return (
    <footer className="bg-gradient-to-br from-[#005f94] to-[#0077B6] text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <img src="/logo.png" alt="ClinIQ Logo" className="h-16 w-auto" />
            <p className="text-gray-200 leading-relaxed">
              Your trusted healthcare provider delivering compassionate, comprehensive medical care.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 font-heading">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/appointment"
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Appointment
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/record"
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xl font-bold mb-6 font-heading">Hours</h4>
            <ul className="space-y-2">
              {hours.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-gray-200">
                  <span className="flex-shrink-0">{item.day}</span>
                  <span className="whitespace-nowrap flex-shrink-0">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-bold mb-6 font-heading">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaPhone className="text-secondary mt-1" />
                <span className="text-gray-200">999-999-9999</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaEnvelope className="text-secondary mt-1" />
                <span className="text-gray-200">ClinIQ@gmail.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <FaLocationDot className="text-secondary mt-1" />
                <span className="text-gray-200">Pune, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-gray-200">
          <p>&copy; {new Date().getFullYear()} ClinIQ Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
