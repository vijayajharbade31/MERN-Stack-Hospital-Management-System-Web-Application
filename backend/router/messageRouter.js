import express from "express";
import {
  getAllMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  markAllAsRead,
} from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";
const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", isAdminAuthenticated, getAllMessages);
router.put("/mark-as-read/:id", isAdminAuthenticated, markAsRead);
router.delete("/delete/:id", isAdminAuthenticated, deleteMessage);
router.put("/mark-all-read", isAdminAuthenticated, markAllAsRead);

export default router;
