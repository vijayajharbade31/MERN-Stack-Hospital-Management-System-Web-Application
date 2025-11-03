import { HiUsers, HiShieldCheck, HiClock, HiHeart } from "react-icons/hi2";

/**
 * Stats Section Component
 * Features:
 * - Impressive statistics display
 * - Animated counters
 * - Professional icons
 * - Gradient background
 */
const StatsSection = () => {
  const stats = [
    {
      icon: HiUsers,
      number: "10,000+",
      label: "Happy Patients",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: HiShieldCheck,
      number: "150+",
      label: "Expert Doctors",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: HiClock,
      number: "15",
      label: "Years Experience",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: HiHeart,
      number: "98%",
      label: "Patient Satisfaction",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-heading">
                  {stat.number}
                </div>
                <div className="text-white/90 font-semibold">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
