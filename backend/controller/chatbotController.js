import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// Rule-based chatbot with keyword matching
const chatbotRules = {
  greetings: {
    keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hi there', 'hey there'],
    response: "Hello! 👋 I'm ClinIQ assistant. How can I help you today?",
    suggestions: ["Appointments", "Hours", "Departments", "Contact"]
  },
  appointment: {
    keywords: ['appointment', 'book', 'schedule', 'visit', 'consultation', 'see doctor'],
    response: "To book an appointment:\n1. Visit the Appointment page\n2. Fill in your details\n3. Select department and doctor\n4. Choose date and time\n\nOr click the Appointment button in the navigation!",
    suggestions: ["How to book", "Departments", "Hours"]
  },
  hours: {
    keywords: ['hours', 'time', 'open', 'when', 'closing', 'working hours', 'hours of operation'],
    response: "Our operating hours:\n\nMonday: 9:00 AM - 11:00 PM\nTuesday: 12:00 PM - 12:00 AM\nWednesday: 10:00 AM - 10:00 PM\nThursday: 9:00 AM - 9:00 PM\nFriday: 3:00 PM - 9:00 PM\nSaturday: 9:00 AM - 3:00 PM\n\nWe're closed on Sundays.",
    suggestions: ["Appointments", "Contact"]
  },
  emergency: {
    keywords: ['emergency', 'urgent', 'critical', 'emergency care', 'immediately', 'asap'],
    response: "🚨 For medical emergencies, please call:\n\n📞 Emergency: 999-999-9999\n\nOr visit the nearest emergency room immediately!",
    suggestions: ["Contact", "Location"]
  },
  departments: {
    keywords: ['department', 'specialist', 'doctor', 'specialty', 'specialties', 'what departments'],
    response: "Our departments:\n🏥 Pediatrics\n🦴 Orthopedics\n❤️ Cardiology\n🧠 Neurology\n🎗️ Oncology\n📷 Radiology\n💪 Physical Therapy\n🌿 Dermatology\n👂 ENT\n\nWhich department are you interested in?",
    suggestions: ["Appointments", "How to book"]
  },
  location: {
    keywords: ['where', 'location', 'address', 'located', 'directions', 'how to reach'],
    response: "📍 Location:\n\nClinIQ Healthcare\nPune, India\n\nFor directions, please contact us at:\n📞 999-999-9999\n📧 ClinIQ@gmail.com",
    suggestions: ["Contact", "Hours"]
  },
  contact: {
    keywords: ['contact', 'phone', 'email', 'reach', 'number', 'call'],
    response: "Contact us:\n\n📞 Phone: 999-999-9999\n📧 Email: ClinIQ@gmail.com\n📍 Location: Pune, India\n\nWe're here to help!",
    suggestions: ["Hours", "Appointments"]
  },
  services: {
    keywords: ['services', 'what services', 'what do you offer', 'treatments'],
    response: "Our services:\n\n✅ Medical Consultations\n✅ Diagnostics & Labs\n✅ Pharmacy Services\n✅ Telemedicine\n✅ Emergency Care\n✅ Preventive Care\n\nWant to know more about any service?",
    suggestions: ["Appointments", "Departments"]
  },
  thank: {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'grateful'],
    response: "You're welcome! 😊 Is there anything else I can help you with?",
    suggestions: ["Hours", "Contact", "Appointments"]
  }
};

// Find matching rule based on keywords
const findMatchingRule = (message) => {
  const lowerMessage = message.toLowerCase();
  
  for (const [ruleName, rule] of Object.entries(chatbotRules)) {
    const hasKeyword = rule.keywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    if (hasKeyword) {
      return {
        reply: rule.response,
        type: ruleName,
        suggestions: rule.suggestions || []
      };
    }
  }
  
  return null;
};

export const chatWithBot = catchAsyncErrors(async (req, res, next) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return next(new ErrorHandler("Please provide a valid message!", 400));
  }

  // Try to find matching rule
  const match = findMatchingRule(message.trim());

  if (match) {
    res.status(200).json({
      success: true,
      data: match
    });
  } else {
    // Default fallback response
    res.status(200).json({
      success: true,
      data: {
        reply: "I'm not sure how to help with that. Please contact us directly at:\n\n📞 Phone: 999-999-9999\n📧 Email: ClinIQ@gmail.com\n\nOr try asking about: Appointments, Hours, Departments, or Services!",
        type: 'unknown',
        suggestions: ["Appointments", "Hours", "Departments", "Contact"]
      }
    });
  }
});

