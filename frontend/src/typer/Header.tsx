import { AppBar, Toolbar } from "@mui/material";
import React from "react";
import Logo from "./shared/Logo";
import { useAuth } from "../context/AuthContext";
import NavigationLink from "./shared/NavigationLink";

// Constants for styling to avoid repetition and improve maintainability
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
 * Header component that displays the app logo and navigation links
 * Changes navigation options based on authentication status
 */
const Header: React.FC = () => {
  const auth = useAuth();

  // Navigation links for authenticated users
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

  // Navigation links for unauthenticated users
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
        bgcolor: "transparent",
        position: "static",
        boxShadow: "none"
      }}
    >
      <Toolbar sx={{ display: "flex" }}>
        <Logo />
        <div>
          {auth?.isLoggedIn ? AuthenticatedLinks : UnauthenticatedLinks}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
