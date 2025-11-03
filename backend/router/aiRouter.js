import express from "express";
import { chatWithBot } from "../controller/chatbotController.js";
import { getDoctorRecommendations } from "../controller/recommendationController.js";
import { summarizePatientHistory, getSmartSlotSuggestions } from "../controller/analyticsController.js";
import { isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Chatbot route (no authentication needed)
router.post("/chat", chatWithBot);

// Doctor recommendations route (no authentication needed)
router.get("/recommend-doctors", getDoctorRecommendations);

// Patient history summarization route
router.get("/summarize/:patientId", isPatientAuthenticated, summarizePatientHistory);

// Smart slot suggestions route (no authentication needed for public)
router.get("/suggest-slots", getSmartSlotSuggestions);

export default router;
// AI router for intelligent features

