import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

const Logo = () => {
    return (
        <div style={{
            display: "flex",
            marginRight: "auto",
            alignItems: "center",
            gap:"15px"
        }}>
            <Link to={"/"}>
            
                <img src="SmartTravelie.png"
                    alt="smart-travel-ie"
                    width={"30px"}
                    height={"30px"}/>

            </Link>{" "}
            <Typography sx={{
                display: {md: "block", sm: "none", xs: "none"},
                mr: "auto",
                fontWeight: "800",
                textShadow: "2px 2px 20px #000",
            }}>
                <span style={{ fontSize: "20px"}}>SmartTravelie</span>

            </Typography>
            
        </div>
    );
};

export default Logo;