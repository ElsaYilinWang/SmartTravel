import React from "react";
import { AppBar, Toolbar } from "@mui/material";
import Logo from "../shared/Logo";
import App from "../../App";

const Header = () => {

    return (
        <AppBar sx={{bgcolor: "transparent", position: "static", boxShadow: "none"}}>
            <Logo />
            

        </AppBar>
    );
}
