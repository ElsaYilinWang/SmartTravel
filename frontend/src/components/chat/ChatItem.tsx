import { Avatar, Box, Typography } from "@mui/material";
import React from "react"; // Removed unused useLayoutEffect
import { useAuth } from "../../context/AuthContext";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
// Removed unused imports

// Constants for styling to improve maintainability
const CHAT_STYLES = {
  container: {
    display: "flex",
    p: 2,
    my: 2,
    gap: 2
  },
  assistant: {
    bgcolor: "#004d5612"
  },
  user: {
    bgcolor: "#004d56"
  },
  avatar: {
    ml: "0"
  },
  userAvatar: {
    bgcolor: "black",
    color: "white"
  },
  message: {
    fontSize: "20px"
  }
} as const;

/**
 * Extracts code blocks from a message string
 * Code blocks are denoted by triple backticks (```)
 */
function extractCodeFromString(message: string) {
  if (message.includes("```")) {
    return message.split("```");
  }
  return null;
}

/**
 * Determines if a string is likely a code block based on common code characters
 */
function isCodeBlock(str: string) {
  const codeIndicators = ["=", ";", "[", "]", "{", "}", "#", "//"];
  return codeIndicators.some(indicator => str.includes(indicator));
}

/**
 * ChatItem component that displays a chat message with support for code blocks
 * - Handles both user and assistant messages
 * - Syntax highlighting for code blocks
 * - Consistent styling with avatars
 */
const ChatItem: React.FC<{
  content: string;
  role: "user" | "assistant";
}> = ({ content, role }) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();

  const isAssistant = role === "assistant";
  
  // Render message content - either as plain text or with code blocks
  const renderContent = () => {
    if (!messageBlocks) {
      return <Typography sx={CHAT_STYLES.message}>{content}</Typography>;
    }

    return messageBlocks.map((block, index) =>
      isCodeBlock(block) ? (
        <SyntaxHighlighter 
          key={index}
          style={coldarkDark} 
          language="javascript"
        >
          {block}
        </SyntaxHighlighter>
      ) : (
        <Typography key={index} sx={CHAT_STYLES.message}>
          {block}
        </Typography>
      )
    );
  };

  return (
    <Box sx={{
      ...CHAT_STYLES.container,
      ...(isAssistant ? CHAT_STYLES.assistant : CHAT_STYLES.user)
    }}>
      <Avatar sx={{
        ...CHAT_STYLES.avatar,
        ...(isAssistant ? {} : CHAT_STYLES.userAvatar)
      }}>
        {isAssistant ? (
          <img src="openai.png" alt="openai" width={"30px"} />
        ) : (
          `${auth?.user?.name[0]}${auth?.user?.name.split(" ")[1][0]}`
        )}
      </Avatar>
      <Box>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default ChatItem;
