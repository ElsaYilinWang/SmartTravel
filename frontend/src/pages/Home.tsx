import {Box, useTheme} from "@mui/material";
import TypingAnim from "../components/typer/TypingAnim";

const Home = () => {
    const theme = useTheme();

    return (
        <Box width={"100%"} height={"100%"}> 
            <Box sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                alignItems: "center",
                mx:"auto",
                mt: 3,
            }}>
                <Box sx={{
                    width:"100%",
                    display: "flex",
                    flexDirection: {md: "row", xs:"column", sm:"column"},
                    gap: 5,
                    my: 10,
                }}>
                    <img src="SmartTravelie.png"
                        alt="smart-travel-ie"
                        style={{ width: "200px", margin: "auto"}}/>

                </Box>
                <Box>
                    <TypingAnim />
                </Box>

            </Box>

        </Box>
    );
};

export default Home;
