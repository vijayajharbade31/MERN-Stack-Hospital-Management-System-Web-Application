import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import UserModel from "../models/userSchema.js";

// Symptom to department mapping
const symptomDoctorMap = {
  'Pediatrics': ['fever', 'cough', 'cold', 'child', 'baby', 'temperature', 'vaccination', 'pediatric', 'infant', 'toddler', 'growth', 'development', 'feeding', 'diaper'],
  'Cardiology': ['chest', 'heart', 'blood pressure', 'hypertension', 'cardiac', 'palpitation', 'breathing', 'shortness', 'chest pain', 'irregular heartbeat', 'dizziness'],
  'Orthopedics': ['bone', 'fracture', 'joint', 'knee', 'shoulder', 'back pain', 'spine', 'elbow', 'wrist', 'ankle', 'hip', 'arthritis', 'mobility', 'injury'],
  'Neurology': ['headache', 'migraine', 'brain', 'seizure', 'dizziness', 'numbness', 'memory', 'cognitive', 'tremor', 'convulsion', 'epilepsy', 'neuralgia'],
  'Dermatology': ['skin', 'rash', 'acne', 'allergy', 'itching', 'eczema', 'dermatitis', 'psoriasis', 'mole', 'wart', 'nail', 'hair loss', 'pigmentation'],
  'ENT': ['ear', 'nose', 'throat', 'hearing', 'tinnitus', 'sinus', 'nasal', 'voice', 'swallowing', 'balance', 'vertigo', 'tonsil'],
  'Oncology': ['cancer', 'tumor', 'malignant', 'benign', 'chemotherapy', 'radiation', 'oncology'],
  'Radiology': ['scan', 'xray', 'mri', 'ct', 'ultrasound', 'imaging', 'diagnostic'],
  'Physical Therapy': ['rehabilitation', 'physiotherapy', 'muscle', 'tension', 'therapy', 'recovery', 'exercise']
};

export const getDoctorRecommendations = catchAsyncErrors(async (req, res, next) => {
  const { symptoms } = req.query;

  if (!symptoms || symptoms.trim().length === 0) {
    return next(new ErrorHandler("Please provide symptoms for recommendations!", 400));
  }

  const symptomsText = symptoms.toLowerCase();
  
  // Find best matching department
  let matchedDepartment = null;
  let maxMatches = 0;
  const departmentScores = {};

  for (const [dept, keywords] of Object.entries(symptomDoctorMap)) {
    let matches = 0;
    
    for (const keyword of keywords) {
      if (symptomsText.includes(keyword)) {
        matches++;
      }
    }
    
    departmentScores[dept] = matches;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      matchedDepartment = dept;
    }
  }

  // If no department matched, default to General Medicine
  if (!matchedDepartment || maxMatches === 0) {
    return res.status(200).json({
      success: true,
      data: {
        recommendations: [],
        message: "Unable to recommend specific doctors based on symptoms. Please select a department manually.",
        suggestedDepartment: null
      }
    });
  }

  // Find doctors in the matched department
  const doctors = await UserModel.find({ 
    role: 'Doctor',
    doctorDepartment: matchedDepartment 
  }).select('firstName lastName email doctorDepartment docAvatar');

  // Return top 3 recommended doctors
  const recommendedDoctors = doctors.slice(0, 3);

  res.status(200).json({
    success: true,
    data: {
      recommendations: recommendedDoctors,
      suggestedDepartment: matchedDepartment,
      matchScore: maxMatches,
      departmentScores: departmentScores
    }
  });
});

