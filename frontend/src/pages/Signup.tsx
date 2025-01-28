import React from "react";
import { IoIosLogIn } from "react-icons/io";
import { Box, Typography, Button } from "@mui/material";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {

    return (
        <Box width={"100%"} height={"100%"} display="flex" flex = {1}>
            <Box display={"flex"}
                    flex={{ xs: 1, md: 0.5 }}
                    justifyContent={"center"}
                    alignItems={"center"}
                    padding={2}
                    ml={"auto"}
                    mt={16}>
                
                <form style={{
                            margin: "auto",
                            padding: "30px",
                            boxShadow: "10px 10px 20px #000",
                            borderRadius: "10px",
                            border: "none",
                        }}>
                    <Typography 
                        variant="h4" textAlign="center" padding={2} fontWeight={600}>
                        Signup
                    </Typography>
                    <label>UserName:</label>
                    <input type="text" id="username" name="username"></input>
                    <label>Password:</label>
                    <input type="text" id="password" name="password"></input>

                    <Button type="submit" sx={{
                        px: 2,
                        py: 1,
                        mt: 2,
                        width: "400px",
                        borderRadius: 2,
                        bgcolor: "purple",
                        ":hover": {
                            bgcolor: "whilte",
                            color: "darkgreen"
                        },
                    }}
                    endIcon={<IoIosLogIn />}>
                        Signup
                    </Button>
                </form>

            </Box>
        </Box>
    );

};

export default Signup;