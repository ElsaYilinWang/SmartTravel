import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer>
            <div style={{
                width: "100%",
                minHeight: "20vh",
                maxHeight: "30vh",
                marginTop: 60,
            }}>
                <p 
                style={{ fontSize: "30px", 
                        textAlign: "center", 
                        padding: "20px"}}>
                            Dedicated with love to my parents by
                            <span>
                                <Link style={{color: "whilte"}}
                                to={"https://github.com/ElsaYilinWang/SmartTravel/tree/main"}>
                                Yilin (Elsa) Wang
                                </Link>
                            </span>
                            😃
                </p>

            </div>
        </footer>

    );
}