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
    } catch (error) {
      toast.error("Failed to send message");
      // Revert the message if sending fails
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
              width: "200px",
              my: "auto",
              color: "white",
              fontWeight: "700",
              borderRadius: 3,
              mx: "auto",
              bgcolor: red[300],
              ":hover": {
                bgcolor: red.A400,
              },
            }}
          >
            Clear Conversation
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
          {chatMessages.map((chat, index) => (
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
