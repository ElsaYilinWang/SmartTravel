import express, { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Load environment variables from .env file
config();

const app = express();

// Enable CORS for frontend application
// credentials:true allows cookies to be sent in cross-origin requests
// We only allow requests from localhost:5173, which is where our frontend application is served
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:64641"],
    credentials: true
  })
);

// Parse incoming JSON requests
// This middleware will parse any JSON requests and populate the req.body property
app.use(express.json());

// Parse cookies and sign them with secret
// This middleware will parse any cookies and sign them with the secret specified in the COOKIE_SECRET environment variable
app.use(cookieParser(process.env.COOKIE_SECRET));

// HTTP request logger middleware for development
// In development mode, we want to log all HTTP requests to the console
// This helps us debug any issues that may arise
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// Mount API routes under /api/v1 prefix
// We mount the API routes under the /api/v1 prefix
// This allows us to easily version our API and make changes to the routes without breaking the frontend
app.use("/api/v1", appRouter);

// Error handling middleware
// This middleware will catch any errors that may occur and return a JSON response with a 500 status code
// We also log the error to the console so that we can debug it
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  console.error(err);
  res.status(status).json({
    message: message,
    success: false
  });
});

export default app;