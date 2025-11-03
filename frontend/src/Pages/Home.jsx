import React from "react";
import ModernHero from "../components/ModernHero";
import StatsSection from "../components/StatsSection";
import ServicesSection from "../components/ServicesSection";
import Departments from "../components/Departments";
import DoctorsSection from "../components/DoctorsSection";
import TestimonialsSection from "../components/TestimonialsSection";

/**
 * Modern Home Page
 * Features:
 * - Hero section with CTA
 * - Stats showcasing our achievements
 * - Services showcase
 * - Doctors section
 * - Testimonials
 * - All components use modern design with healthcare theme
 */
const Home = () => {
  return (
    <div className="min-h-screen">
      <ModernHero />
      <StatsSection />
      <ServicesSection />
      <Departments />
      <DoctorsSection />
      <TestimonialsSection />
    </div>
  );
};

export default Home;
