import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import appRouter from "./src/routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Load environment variables from .env file
config();

const app = express();

// Middleware Configuration
// Enable CORS for frontend application
// credentials:true allows cookies to be sent in cross-origin requests
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse cookies and sign them with secret
app.use(cookieParser(process.env.COOKIE_SECRET));

// HTTP request logger middleware for development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
}

// Mount API routes under /api/v1 prefix
app.use("/api/v1", appRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({
    message: message,
    success: false
  });
});

export default app;