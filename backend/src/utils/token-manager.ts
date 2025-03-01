import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

type StringValue = {
  toString(): string;
};

/**
 * Creates a JWT token with user ID and email
 * @param id - User ID to encode in token
 * @param email - User email to encode in token  
 * @param expiresIn - Token expiration time (e.g. "24h", "7d")
 * @returns Signed JWT token string
 */
export const createToken = (id: string, email: string, expiresIn: string | number): string => {
  const payload = { id, email };
  const options = {
    expiresIn: expiresIn || "1d" // Default to 1 day if not specified
  } as jwt.SignOptions;
  const secret: Secret = process.env.JWT_SECRET || 'default_secret';
  // Sign token with JWT secret from environment variables
  return jwt.sign(payload, secret, options);
};

/**
 * Middleware to verify JWT token from signed cookie
 * Adds decoded token data to res.locals.jwtData if valid
 */
export const verifyToken = async (
  req: Request, 
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  // Get token from signed cookies
  const token = req.signedCookies[COOKIE_NAME];

  if (!token?.trim()) {
    return res.status(401).json({ message: "Token Not Received!" });
  }

  try {
    // Verify token and decode payload
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    // Add decoded data to response locals for downstream middleware
    res.locals.jwtData = decoded;
    return next();

  } catch (error) {
    // Return 401 if token is invalid or expired
    return res.status(401).json({ message: "Token Expired!" });
  }
};
