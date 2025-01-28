import { Box, Typography, Button } from "@mui/material";
import React, { useEffect } from "react";
import { IoIosLogIn } from "react-icons/io";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const formStyles = {
    margin: "auto",
    padding: "30px",
    boxShadow: "10px 10px 20px #000",
    borderRadius: "10px",
    border: "none",
  };

  const buttonStyles = {
    px: 2,
    py: 1,
    mt: 2,
    width: "400px",
    borderRadius: 2,
    bgcolor: "#00fffc",
    ":hover": {
      bgcolor: "white",
      color: "black",
    },
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      toast.loading("Signing Up!", { id: "signup" });
      await auth?.signup(name, email, password);
      toast.success("Signup successful!", { id: "signup" });
      navigate("/chat");
    } catch (error) {
      console.error(error);
      toast.error("Signup Failed", { id: "signup" });
    }
  };

  useEffect(() => {
    if (auth?.user) {
      navigate("/chat");
    }
  }, [auth, navigate]);

  return (
    <Box width="100%" height="100%" display="flex" flex={1}>
      <Box padding={8} mt={8} display={{ md: "flex", sm: "none", xs: "none" }}>
        <img src="airobot.png" alt="Robot" style={{ width: "400px" }} />
      </Box>
      <Box
        display="flex"
        flex={{ xs: 1, md: 0.5 }}
        justifyContent="center"
        alignItems="center"
        padding={2}
        ml="auto"
        mt={16}
      >
        <form onSubmit={handleSubmit} style={formStyles}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              padding={2}
              fontWeight={600}
            >
              Signup
            </Typography>
            <CustomizedInput name="name" type="text" label="Name" />
            <CustomizedInput name="email" type="email" label="Email" />
            <CustomizedInput name="password" type="password" label="Password" />
            <Button
              type="submit"
              sx={buttonStyles}
              endIcon={<IoIosLogIn />}
            >
              SIGNUP
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Signup;
