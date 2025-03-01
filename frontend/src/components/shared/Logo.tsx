import { Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

// Constants for styling to improve maintainability and reusability
const LOGO_STYLES = {
  container: {
    display: "flex",
    marginRight: "auto", 
    alignItems: "center",
    gap: "8px"
  },
  image: {
    width: "50px",
    height: "50px",
    margin: "auto",
    padding: "auto"
  },
  text: {
    display: { md: "block", sm: "none", xs: "none" },
    mr: "auto",
    fontWeight: "800",
    textShadow: "2px 2px 20px #000"
  },
  smartTravelText: {
    fontSize: "15px"
  }
} as const;

const Logo: React.FC = () => {
    return (
      <div style={LOGO_STYLES.container}>
        <Link to="/">
          <img
            src="SmartTravelie.png"
            alt="smart-travel-ie"
            style={LOGO_STYLES.image}
            className="image-inverted"
          />
          <Typography sx={LOGO_STYLES.text}>
            <span style={LOGO_STYLES.smartTravelText}>SmartTravel-Ireland</span>
          </Typography>
        </Link>
      </div>
    );
  };
  
  export default Logo;