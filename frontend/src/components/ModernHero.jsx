import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { useState } from "react";
import MessageModal from "./MessageModal";

/**
 * Modern Hero Section Component
 * Features:
 * - Two-column responsive grid layout
 * - Subtle gradient background (white to light blue)
 * - Professional medical imagery
 * - Clear call-to-action button
 * - Fade-in animation on scroll
 */
const ModernHero = () => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 py-24 md:py-36">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary rounded-full"></div>
        <div className="absolute top-40 left-60 w-3 h-3 bg-secondary rounded-full"></div>
        <div className="absolute top-60 left-32 w-5 h-5 bg-accent rounded-full"></div>
        <div className="absolute top-80 right-40 w-4 h-4 bg-primary rounded-full"></div>
        <div className="absolute top-32 right-60 w-3 h-3 bg-secondary rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight font-heading">
              Welcome to{" "}
              <span className="text-primary">ClinIQ Healthcare</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Your trusted healthcare provider delivering compassionate,
              comprehensive medical care. Our dedicated team of skilled
              professionals is committed to your well-being, ensuring a
              harmonious journey towards optimal health.
            </p>

            {/* Features List */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-gray-700">24/7 Emergency Care</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-gray-700">Expert Medical Professionals</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <span className="text-gray-700">State-of-the-Art Facilities</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/appointment"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-[#005f94] transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
              >
                <span>Book Appointment</span>
                <HiArrowRight className="text-xl" />
              </Link>
              <button
                onClick={() => setIsMessageModalOpen(true)}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl border-2 border-primary hover:bg-primary/5 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span>Message Us</span>
              </button>
              <MessageModal 
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
              />
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative animate-fade-in-slow flex justify-center items-center">
            <div className="relative w-3/4 max-w-md">
              {/* Subtle outline effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl transform translate-y-8 scale-110 animate-pulse"></div>
              
              {/* Floating particles effect */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
              <div className="absolute -bottom-4 -right-4 w-2 h-2 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              <div className="absolute top-1/2 -right-6 w-3 h-3 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
              
              {/* Main image with border gradient */}
              <div className="relative rounded-3xl p-2 bg-gradient-to-r from-primary via-secondary to-primary/80 hover:shadow-2xl transition-shadow duration-500">
                <img
                  src="/hero.png"
                  alt="Healthcare Professional"
                  className="relative rounded-3xl shadow-2xl w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-2xl p-4 border-2 border-primary/20 hover:scale-110 transition-transform duration-300 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold">Patient Care</div>
                    <div className="text-base font-bold text-primary">5,000+</div>
                  </div>
                </div>
              </div>
              
              {/* Second floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-2xl p-4 border-2 border-secondary/20 hover:scale-110 transition-transform duration-300 z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-semibold">24/7 Support</div>
                    <div className="text-base font-bold text-secondary">Available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
