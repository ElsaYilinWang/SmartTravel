/**
 * Main Application Component
 * 
 * This is the root component of the Smart Travel application that handles:
 * - Route configuration and navigation
 * - Authentication-based route protection
 * - Global layout structure
 * 
 * The component uses React Router for navigation and AuthContext for
 * authentication state management.
 */

import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./pages/Home";
import Login from "./pages/Login"; 
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Map from "./pages/Map";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

/**
 * App Component
 * 
 * Renders the main application structure including:
 * - Global header navigation
 * - Route configuration
 * - Protected route handling
 * 
 * Uses AuthContext to manage authentication state and protect routes
 * that require user login.
 * 
 * @returns {JSX.Element} The rendered application
 */
function App() {
  // Get authentication context to check login status
  const auth = useAuth();

  return (
    <main>
      {/* Global header shown on all pages */}
      <Header />

      {/* Route configuration */}
      <Routes>
        {/* Public routes accessible to all users */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/map" element={auth?.isLoggedIn && auth.user ? <Map /> : <Login />} />

        {/* Protected route - redirects to login if user is not authenticated */}
        <Route 
          path="/chat" 
          element={auth?.isLoggedIn && auth.user ? <Chat /> : <Login />}
        />

        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

export default App;
