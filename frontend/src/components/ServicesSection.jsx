import { HiOutlineClipboardDocumentCheck, HiOutlineMagnifyingGlass, HiOutlineBolt, HiOutlinePhone } from "react-icons/hi2";

/**
 * Services Section Component
 * Features:
 * - Grid of service cards with icons
 * - Hover lift effect
 * - Clean card design with shadows
 * - Healthcare-themed service offerings
 */
const ServicesSection = () => {
  const services = [
    {
      icon: HiOutlineClipboardDocumentCheck,
      title: "Consultation",
      description:
        "Expert medical consultations with experienced healthcare professionals tailored to your needs.",
      color: "bg-blue-100 text-primary",
    },
    {
      icon: HiOutlineMagnifyingGlass,
      title: "Diagnostics",
      description:
        "Advanced diagnostic services with state-of-the-art equipment for accurate results.",
      color: "bg-cyan-100 text-secondary",
    },
    {
      icon: HiOutlineBolt,
      title: "Pharmacy",
      description:
        "Complete pharmaceutical services with prescription management and medication counseling.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: HiOutlinePhone,
      title: "Telemedicine",
      description:
        "Virtual consultations with our medical team from the comfort of your home.",
      color: "bg-pink-100 text-accent",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-secondary rounded-full"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 border-2 border-primary rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Our Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
            Comprehensive Healthcare Services
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trusted medical care designed to meet all your healthcare needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 hover:-translate-y-3 relative overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Icon */}
                <div
                  className={`relative z-10 w-18 h-18 ${service.color} rounded-2xl p-4 flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}
                >
                  <Icon className="w-10 h-10" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-heading group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
