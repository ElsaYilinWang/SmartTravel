/**
 * Header Component
 * 
 * A responsive navigation header that adapts its content based on authentication state.
 * Features:
 * - Persistent logo display
 * - Dynamic navigation links
 * - Authentication-aware rendering
 * - Consistent styling with theme
 * 
 * @module Components/Header
 */

import { AppBar, Toolbar } from "@mui/material";
import React from "react";
import Logo from "../shared/Logo";
import { useAuth } from "../../context/AuthContext";
import NavigationLink from "../shared/NavigationLink";

/**
 * Style Constants
 * 
 * Defines consistent styling for navigation links:
 * - PRIMARY: Used for main actions (e.g., Chat, Login)
 * - SECONDARY: Used for secondary actions (e.g., Logout, Signup)
 */
const LINK_STYLES = {
  PRIMARY: {
    bg: "#00fffc",
    textColor: "black"
  },
  SECONDARY: {
    bg: "#51538f", 
    textColor: "white"
  }
} as const;

/**
 * Header Component
 * 
 * Renders the application header with:
 * - App logo
 * - Navigation links based on auth state
 * - Consistent styling and positioning
 * 
 * Uses Material-UI's AppBar for layout and styling
 * 
 * @component
 * @example
 * return (
 *   <Header />
 * )
 */
const Header: React.FC = () => {
  // Get authentication context for dynamic rendering
  const auth = useAuth();

  /**
   * Navigation Links for Authenticated Users
   * 
   * Includes:
   * - Chat access
   * - Logout functionality
   */
  const AuthenticatedLinks = (
    <>
      <NavigationLink
        bg={LINK_STYLES.PRIMARY.bg}
        to="/chat"
        text="Go To Chat"
        textColor={LINK_STYLES.PRIMARY.textColor}
      />
      <NavigationLink
        bg={LINK_STYLES.SECONDARY.bg}
        textColor={LINK_STYLES.SECONDARY.textColor}
        to="/"
        text="logout"
        onClick={auth.logout}
      />
    </>
  );

  /**
   * Navigation Links for Unauthenticated Users
   * 
   * Includes:
   * - Login option
   * - Signup option
   */
  const UnauthenticatedLinks = (
    <>
      <NavigationLink
        bg={LINK_STYLES.PRIMARY.bg}
        to="/login"
        text="Login"
        textColor={LINK_STYLES.PRIMARY.textColor}
      />
      <NavigationLink
        bg={LINK_STYLES.SECONDARY.bg}
        textColor={LINK_STYLES.SECONDARY.textColor}
        to="/signup"
        text="Signup"
      />
    </>
  );

  return (
    <AppBar
      sx={{
        bgcolor: "transparent", // Transparent background
        position: "static",     // Fixed positioning
        boxShadow: "none"      // Remove default shadow
      }}
    >
      <Toolbar sx={{ display: "flex" }}>
        {/* App Logo */}
        <Logo />
        
        {/* Dynamic Navigation Links */}
        <div>
          {auth?.isLoggedIn ? AuthenticatedLinks : UnauthenticatedLinks}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
