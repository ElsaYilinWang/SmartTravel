import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatRoutes from "./chat-routes.js";

/**
 * Main router that combines all sub-routes
 * Handles routing for the entire API
 */
const appRouter = Router();

// Mount user-related routes under /user
// Full path: /api/v1/user/*
// Handles authentication, registration and user management
appRouter.use("/user", userRoutes);

// Mount chat-related routes under /chat 
// Full path: /api/v1/chat/*
// Handles chat functionality and messaging
appRouter.use("/chat", chatRoutes);

export default appRouter;