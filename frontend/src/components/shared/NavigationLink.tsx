import { Link } from "react-router-dom";

// Define prop types for the navigation link component
type NavigationLinkProps = {
  to: string;      // Route path to navigate to
  bg: string;      // Background color of the link
  text: string;    // Text to display in the link
  textColor: string; // Color of the link text
  onClick?: () => Promise<void>; // Optional click handler
};

// Style object to keep styling consistent and reusable
const LINK_STYLE = {
  base: (bg: string, textColor: string) => ({
    background: bg,
    color: textColor,
  })
};

/**
 * NavigationLink component that wraps React Router Link
 * with consistent styling and simplified props
 */
const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  to,
  bg,
  text,
  textColor,
  onClick
}) => {
  return (
    <Link
      onClick={onClick}
      className="nav-link"
      to={to}
      style={LINK_STYLE.base(bg, textColor)}
    >
      {text}
    </Link>
  );
};

export default NavigationLink;
