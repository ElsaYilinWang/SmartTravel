/**
 * Logo Component
 * 
 * A reusable logo component that provides:
 * - Consistent branding across the application
 * - Responsive design
 * - Navigation to home page
 * - Customizable styling
 * 
 * @module Components/Shared/Logo
 */

import { Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

/**
 * Style Configuration
 * 
 * Defines consistent styling for the logo component:
 * - Responsive layout and positioning
 * - Image dimensions and spacing
 * - Typography and text effects
 * - Breakpoint-specific display rules
 */
const LOGO_STYLES = {
  container: {
    display: "flex",
    marginRight: "auto",  // Push content to the left
    alignItems: "center", // Vertical alignment
    gap: "8px"           // Space between image and text
  },
  image: {
    width: "50px",
    height: "50px",
    margin: "auto",
    padding: "auto"
  },
  text: {
    // Responsive display based on breakpoints
    display: { 
      md: "block",  // Show on medium and larger screens
      sm: "none",   // Hide on small screens
      xs: "none"    // Hide on extra small screens
    },
    mr: "auto",
    fontWeight: "800",
    textShadow: "2px 2px 20px #000" // Text shadow for better visibility
  },
  smartTravelText: {
    fontSize: "15px"
  }
} as const;

/**
 * Logo Component
 * 
 * Renders the application logo with:
 * - Clickable link to home page
 * - Brand image
 * - Responsive text display
 * - Consistent styling
 * 
 * @component
 * @example
 * return (
 *   <Logo />
 * )
 */
const Logo: React.FC = () => {
  return (
    <div style={LOGO_STYLES.container}>
      {/* Home page navigation */}
      <Link to="/">
        {/* Logo image with inversion effect */}
        <img
          src="SmartTravelie.png"
          alt="smart-travel-ie"
          style={LOGO_STYLES.image}
          className="image-inverted"
        />
        {/* Brand text with responsive display */}
        <Typography sx={LOGO_STYLES.text}>
          <span style={LOGO_STYLES.smartTravelText}>
            SmartTravel-Ireland
          </span>
        </Typography>
      </Link>
    </div>
  );
};

export default Logo;