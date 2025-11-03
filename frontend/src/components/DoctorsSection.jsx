import { useEffect, useState } from "react";
import axios from "../utils/api";
import { HiOutlineAcademicCap } from "react-icons/hi2";

/**
 * Doctors Section Component
 * Features:
 * - Grid layout showcasing doctors
 * - Professional doctor cards with images and specialties
 * - Responsive design
 * - Fetch real doctor data from API
 */
const DoctorsSection = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get("/user/doctors");
        setDoctors(data.doctors?.slice(0, 6) || []); // Show max 6 doctors
      } catch (err) {
        console.error("Failed to load doctors:", err);
        // Use placeholder data if API fails
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-secondary/10 text-secondary text-sm font-semibold rounded-full mb-4">
            Medical Team
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
            Our Expert Doctors
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet our experienced medical professionals dedicated to your health and wellness
          </p>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No doctors available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor, index) => (
              <div
                key={doctor._id || index}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Doctor Image from backend (same as dashboard: docAvatar.url) */}
                <div className="relative h-72 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10 overflow-hidden rounded-t-2xl">
                  {/* Image attempt */}
                  <img
                    src={doctor.docAvatar && doctor.docAvatar.url ? doctor.docAvatar.url : ''}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                    className="absolute inset-0 w-full h-full object-cover object-center block group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = document.getElementById(`doctor-${index}-fallback`);
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  
                  {/* Fallback: Initial or placeholder */}
                  <div 
                    id={`doctor-${index}-fallback`}
                    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/30 via-secondary/30 to-primary/20 absolute inset-0"
                    style={{ display: doctor.docAvatar && doctor.docAvatar.url ? 'none' : 'flex' }}
                  >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl mb-4">
                      <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-base text-white font-bold uppercase tracking-wider px-3 py-1 bg-primary/30 rounded-full">
                      {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
                    </div>
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300"></div>
                  
                  {/* Professional Badge */}
                  <div className="absolute top-5 right-5 bg-white rounded-full p-3 shadow-xl transform group-hover:scale-110 transition-transform duration-300 z-10">
                    <HiOutlineAcademicCap className="w-7 h-7 text-primary" />
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading group-hover:text-primary transition-colors">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  <div className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                    {doctor.doctorDepartment || "General Medicine"}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm pt-2 border-t border-gray-100">
                    <svg
                      className="w-5 h-5 mr-2 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-600">{doctor.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorsSection;
