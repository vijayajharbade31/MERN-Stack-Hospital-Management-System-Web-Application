import { FaStar } from "react-icons/fa";

/**
 * Testimonials Section Component
 * Features:
 * - Patient review cards
 * - Star ratings
 * - Clean card design
 * - Subtle animations
 */
const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Patient",
      text: "Excellent service and care! The staff was professional and the facilities were top-notch. Highly recommend.",
      rating: 5,
      avatar: "👩‍🦰",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Patient",
      text: "The doctors are very knowledgeable and took time to explain everything. The telemedicine service is convenient too.",
      rating: 5,
      avatar: "👨‍💼",
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Patient",
      text: "Best healthcare experience I've had. Quick appointment booking, minimal wait time, and exceptional care.",
      rating: 5,
      avatar: "👩‍💻",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
            What Our Patients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from our valued patients who trust us with their health
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 hover:-translate-y-3 relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-2xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>

                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-6xl text-primary/10 font-serif leading-none">"</div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-8 leading-relaxed italic text-lg">
                  {testimonial.text}
                </p>

                {/* Author Info */}
                <div className="flex items-center space-x-4 pt-6 border-t-2 border-gray-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-3xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
