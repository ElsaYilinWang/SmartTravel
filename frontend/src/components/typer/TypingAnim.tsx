import { TypeAnimation } from "react-type-animation";

const TypingAnim = () => {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed once, initially
        "Welcome to SMARTTRAVELIE",
        1000,
        "欢迎来到爱岛智能旅行",
        1500,
        "Let's start the adventure and explore infinity!",
        1500,
        "让我们一起开启旅程、探索未知！",
        2000,
      ]}
      speed={60}
      style={{
        fontSize: "60px",
        color: "white",
        display: "inline-block",
        textShadow: "1px 1px 20px #000",
      }}
      repeat={Infinity}
    />
  );
};

export default TypingAnim;