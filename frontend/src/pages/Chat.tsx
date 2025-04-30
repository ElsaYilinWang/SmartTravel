import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { red } from "@mui/material/colors";
import ChatItem from "../components/chat/ChatItem";
import { IoMdSend } from "react-icons/io";
import {
  deleteUserChats,
  getUserChats,
  sendChatRequest,
} from "../helpers/api-communicator";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Define Message type for chat messages
type Message = {
  role: "user" | "assistant";
  content: string;
};

// Define ChatResponse type for API responses
type ChatResponse = {
  chats: Message[];
};

// Define Chat component
const Chat: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const auth = useAuth();
  // Demo messages for first-time users
const demoMessages: Message[] = [
  {
    role: "user",
    content: "Can you create a 7-day travel itinerary in Ireland for a low budget?"
  },
  {
    role: "assistant",
    content: `Absolutely! Here’s a 7-day low-budget itinerary for Ireland:\n\n**Day 1: Dublin**\n- Explore Trinity College & Book of Kells\n- Walk around Temple Bar (avoid eating here for budget)\n- Stay in a hostel\n\n**Day 2: Dublin to Galway**\n- Take a morning bus/train to Galway\n- Explore Latin Quarter & Spanish Arch\n- Free street music in the evening\n\n**Day 3: Galway & Cliffs of Moher**\n- Day tour to Cliffs of Moher (find budget group tours)\n- Return to Galway\n\n**Day 4: Galway to Killarney**\n- Bus to Killarney\n- Walk in Killarney National Park\n- Budget B&B or hostel\n\n**Day 5: Ring of Kerry**\n- Join a budget tour or use public bus for Ring of Kerry highlights\n- Return to Killarney\n\n**Day 6: Killarney to Cork**\n- Bus to Cork\n- Visit English Market\n- Explore city on foot\n\n**Day 7: Cork to Dublin**\n- Return to Dublin by bus/train\n- Last-minute sightseeing or shopping\n\n**Tips:**\n- Use public transport (buses/trains)\n- Stay in hostels or budget B&Bs\n- Eat at supermarkets or local cafes\n- Book tours in advance for discounts\n\nLet me know if you want to adjust this itinerary or need more details!`
  }
];

const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // Handle sending new messages
  const handleSubmit = async () => {
    const content = inputRef.current?.value;
    if (!content?.trim()) return; // Don't send empty messages

    // Clear input field
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Add user message immediately for better UX
    const newMessage: Message = { role: "user", content };
    setChatMessages(prev => [...prev, newMessage]);

    try {
      // Send message to API and update with response
      const chatData = await sendChatRequest(content) as ChatResponse;
      if (chatData && typeof chatData === 'object' && 'chats' in chatData) {
        setChatMessages(chatData.chats);
      }
    } catch (error: any) {
      // Robustly check for 429 and rate limit from various error shapes
      const status = error?.response?.status || error?.status || error?.response?.data?.status;
      const message = error?.response?.data?.message || error?.message || "";
      if (status === 429 || message.includes("Rate limit exceeded")) {
        toast.error("You're sending messages too quickly. Please wait and try again.");
      } else {
        toast.error("Failed to send message");
      }
      setChatMessages(prev => prev.slice(0, -1));
    }
  };

  // Handle deleting all chats
  const handleDeleteChats = async () => {
    const toastId = "deletechats";
    try {
      toast.loading("Deleting Chats", { id: toastId });
      await deleteUserChats();
      setChatMessages([]);
      toast.success("Deleted Chats Successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Deleting chats failed", { id: toastId });
    }
  };

  // Load existing chats on component mount
  useLayoutEffect(() => {
    const loadChats = async () => {
      if (!auth?.isLoggedIn || !auth.user) return;

      const toastId = "loadchats";
      try {
        toast.loading("Loading Chats", { id: toastId });
        const data = await getUserChats();
        if (data && typeof data === 'object' && 'chats' in data) {
          setChatMessages(data.chats as Message[]);
          toast.success("Successfully loaded chats", { id: toastId });
        }
      } catch (err) {
        console.error(err);
        toast.error("Loading Failed", { id: toastId });
      }
    };

    loadChats();
  }, [auth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.user) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        width: "100%",
        height: "100%",
        mt: 3,
        gap: 3,
      }}
    >
      <Box
        sx={{
          display: { md: "flex", sm: "none", xs: "none" },
          flex: 0.2,
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "60vh",
            bgcolor: "rgb(17, 29, 39)",
            borderRadius: 5,
            flexDirection: "column",
            mx: 3,
          }}
        >
          <Avatar
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: "white",
              color: "black",
              fontWeight: 700,
            }}
          >
            {auth?.user?.name[0]}
            {auth?.user?.name.split(" ")[1]?.[0]}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily: "work sans" }}>
            You are talking to a ChatBOT...
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily: "work sans", my: 4, p: 3 }}>
            You can ask questions but please avoid sharing personal information.
          </Typography>
          <Button
            onClick={handleDeleteChats}
            sx={{
              mx: "auto",
              my: 2,
              bgcolor: red[500],
              color: "white",
              fontWeight: 700,
              fontFamily: "work sans",
              borderRadius: 3,
              px: 3,
              py: 1,
              ":hover": {
                bgcolor: red[700],
              },
            }}
          >
            Delete All Chats
          </Button>
          <Button
            onClick={() => navigate("/map")}
            sx={{
              mx: "auto",
              my: 1,
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 700,
              fontFamily: "work sans",
              borderRadius: 3,
              px: 3,
              py: 1,
              ":hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Go to Map
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: { md: 0.8, xs: 1, sm: 1 },
          flexDirection: "column",
          px: 3,
        }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "40px",
            color: "white",
            mb: 2,
            mx: "auto",
            fontWeight: "600",
          }}
        >
          Model - GPT 3.5 Turbo
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "60vh",
            borderRadius: 3,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "scroll",
            overflowX: "hidden",
            overflowY: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {(chatMessages.length === 0 ? demoMessages : chatMessages).map((chat, index) => (
            <ChatItem 
              content={chat.content} 
              role={chat.role} 
              key={index} 
            />
          ))}
        </Box>
        <div
          style={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "rgb(17, 27, 39)",
            display: "flex",
            margin: "auto",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            style={{
              width: "100%",
              backgroundColor: "transparent",
              padding: "30px",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: "20px",
            }}
          />
        </div>
        <IconButton
          onClick={handleSubmit}
          sx={{ ml: "auto", color: "white", mx: 1 }}
        >
          <IoMdSend />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
