import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import {
  deleteChats,
  generateChatCompletion,
  sendChatsToUser,
} from "../controllers/chat-controllers.js";

/**
 * Router for chat-related endpoints
 * All routes are protected with JWT authentication via verifyToken middleware
 */
const chatRoutes = Router();

// Generate new chat completion
// POST /api/chat/new
// Validates chat message and verifies user token before generating response
chatRoutes.post(
  "/new",
  validate(chatCompletionValidator), // Validate message content
  verifyToken, // Verify JWT token
  generateChatCompletion // Generate AI response
);

// Get all chats for authenticated user
// GET /api/chat/all-chats 
chatRoutes.get("/all-chats", verifyToken, sendChatsToUser);

// Delete all chats for authenticated user
// DELETE /api/chat/delete
chatRoutes.delete("/delete", verifyToken, deleteChats);

export default chatRoutes;
