import React from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";

const Appointment = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Hero
        title={"Schedule Your Appointment | ClinIQ Healthcare"}
        imageUrl={"/signin.png"}
      />
      <div className="py-8">
        <AppointmentForm/>
      </div>
    </div>
  );
};

export default Appointment;
