/**
 * Application Entry Point
 * 
 * This is the main entry point of the Smart Travel application that:
 * - Configures global providers and context
 * - Sets up axios defaults for API communication
 * - Initializes theme configuration
 * - Renders the root application component
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import axios from "axios";
import { Toaster } from "react-hot-toast";

/**
 * Axios Configuration
 * 
 * Configure global axios defaults for API requests:
 * - Base URL for all API calls
 * - Credentials inclusion for authentication
 */
axios.defaults.baseURL = "http://localhost:5000/api/v1";
axios.defaults.withCredentials = true;

/**
 * Material-UI Theme Configuration
 * 
 * Create a custom theme for consistent styling:
 * - Set default font family
 * - Configure typography variants
 * - Define color scheme
 */
const theme = createTheme({
  typography: {
    fontFamily: "Roboto Slab, serif",
    allVariants: { color: "white" },
  },
});

/**
 * Root Element Selection
 * 
 * Get the root DOM element and validate its existence
 * Throw error if root element is not found to fail fast
 */
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

/**
 * Application Rendering
 * 
 * Render the application with all necessary providers:
 * - React.StrictMode for development checks
 * - AuthProvider for authentication state
 * - BrowserRouter for routing
 * - ThemeProvider for consistent styling
 * - Toaster for notifications
 */
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Toaster position="top-center" />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);