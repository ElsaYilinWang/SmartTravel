import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";
import { hash, compare } from "bcrypt";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

/**
 * Retrieves all users from the database
 * Used for admin/debugging purposes
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    return res.status(200).json({ message: "OK", users });
  } catch (error: any) {
    console.error('Error getting users:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};

/**
 * Creates a new user account
 * Validates email uniqueness and hashes password before saving
 */
export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).send("User already exists");
    }

    // Create new user with hashed password
    const hashedPassword = await hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    return res.status(201).json({
      message: "User created successfully",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};

/**
 * Authenticates user login
 * Validates credentials and sets authentication cookie
 */
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
    // Validate user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User not registered");
    }

    // Validate password
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).send("Incorrect password");
    }

    // Set authentication cookie
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // Clear any existing cookie first
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    // Set new cookie
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res.status(200).json({
      message: "Login successful",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};

/**
 * Verifies user authentication status
 * Checks if user exists and has proper permissions
 */
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR token malfunctioned");
    }

    // Verify user has proper permissions
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission denied");
    }

    return res.status(200).json({
      message: "User verified",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};

/**
 * Logs out user by clearing authentication cookie
 * Verifies user exists and has proper permissions before logout
 */
export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR token malfunctioned");
    }

    // Verify user has proper permissions
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission denied");
    }

    // Clear authentication cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    return res.status(200).json({
      message: "Logout successful",
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};
