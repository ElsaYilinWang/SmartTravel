import { Router } from "express";
import { getAllUsers, userSignup, userLogin, verifyUser, userLogout } from "../controllers/user-controllers.js";
import { loginValidator, signupValidator, validate } from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";

/**
 * Router for user-related endpoints
 * Handles user authentication, registration and profile management
 */
const userRoutes = Router();

// Get all users (admin route)
// GET /api/v1/user
userRoutes.get("/", getAllUsers);

// User registration
// POST /api/v1/user/signup
// Validates signup data before creating new user
userRoutes.post(
  "/signup",
  validate(signupValidator), // Validate registration data
  userSignup // Create new user account
);

// User login 
// POST /api/v1/user/login
// Validates login credentials and creates session
userRoutes.post(
  "/login",
  validate(loginValidator), // Validate login credentials
  userLogin // Authenticate and create session
);

// User logout
// GET /api/v1/user/logout 
// Requires valid JWT token
userRoutes.get(
  "/logout",
  verifyToken, // Verify user is authenticated
  userLogout // Clear user session
);

// Verify authentication status
// GET /api/v1/user/auth-status
// Requires valid JWT token
userRoutes.get(
  "/auth-status",
  verifyToken, // Verify user is authenticated  
  verifyUser // Check auth status
);

export default userRoutes;