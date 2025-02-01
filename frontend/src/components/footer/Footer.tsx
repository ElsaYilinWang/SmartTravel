import React from "react";
import { Link } from "react-router-dom";

// Constants for styling to improve maintainability and reusability
const FOOTER_STYLES = {
  container: {
    width: "100%",
    padding: "20px",
    minHeight: "20vh", 
    maxHeight: "30vh",
    marginTop: "50px"
  },
  text: {
    fontSize: "30px",
    textAlign: "center" as const,
    padding: "30px"
  },
  link: {
    color: "white"
  }
} as const;

/**
 * Footer component that displays attribution and reference link
 * Uses React Router Link for client-side navigation
 * Styled with consistent spacing and typography
 */

const Footer: React.FC = () => {
    return (
      <footer>
        <div style={FOOTER_STYLES.container}>
          <p style={FOOTER_STYLES.text}>
          Dedicated with love to my parents by
            <span>
              <Link
                style={FOOTER_STYLES.link}
                className="nav-link"
                to="https://github.com/ElsaYilinWang/SmartTravel/tree/main"
              >
                Yilin (Elsa) Wang
              </Link>
            </span>
            😃
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
  