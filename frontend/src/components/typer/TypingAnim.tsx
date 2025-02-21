import React from "react";
import { TypeAnimation } from "react-type-animation";

// Constants for animation configuration
const ANIMATION_SEQUENCES = [
  "Welcome to SmartTravel-Ireland", // Initial message
  2000, // Pause for 1 second
  "Let's start the adventure!",
  2000, // Pause for 2 seconds  
  "Good Luck!",
  1500, // Pause for 1.5 seconds
] ;

const TEXT_STYLE = {
  fontSize: "60px",
  color: "white", 
  display: "inline-block",
  textShadow: "1px 1px 20px #000",
} as const;

/**
 * TypingAnim component that displays an animated typing effect
 * Uses react-type-animation to create a typewriter effect with multiple messages
 */

const TypingAnim: React.FC = () => {
  return (
    <TypeAnimation
      sequence={ANIMATION_SEQUENCES}
      speed={50} // Characters per second
      style={TEXT_STYLE}
      repeat={Infinity} // Loop animation indefinitely
    />
  );
};

export default TypingAnim;