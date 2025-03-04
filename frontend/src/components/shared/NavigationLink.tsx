/**
 * NavigationLink Component
 * 
 * A reusable navigation link component that provides:
 * - Consistent styling across the application
 * - Type-safe props
 * - Integration with React Router
 * - Optional click handling
 * 
 * @module Components/Shared/NavigationLink
 */

import { Link } from "react-router-dom";

/**
 * NavigationLink Props Interface
 * 
 * @typedef {Object} NavigationLinkProps
 * @property {string} to - Route path to navigate to
 * @property {string} bg - Background color of the link
 * @property {string} text - Text to display in the link
 * @property {string} textColor - Color of the link text
 * @property {() => Promise<void>} [onClick] - Optional async click handler
 */
type NavigationLinkProps = {
  to: string;      // Route path to navigate to
  bg: string;      // Background color of the link
  text: string;    // Text to display in the link
  textColor: string; // Color of the link text
  onClick?: () => Promise<void>; // Optional click handler
};

/**
 * Style Configuration
 * 
 * Defines reusable styling patterns for the navigation link:
 * - Base styles that can be customized through props
 * - Consistent styling application across instances
 * 
 * @param {string} bg - Background color
 * @param {string} textColor - Text color
 * @returns {Object} Style object for the link
 */
const LINK_STYLE = {
  base: (bg: string, textColor: string) => ({
    background: bg,
    color: textColor,
  })
};

/**
 * NavigationLink Component
 * 
 * A styled navigation link that:
 * - Integrates with React Router for navigation
 * - Applies consistent styling
 * - Handles click events
 * - Maintains type safety
 * 
 * @component
 * @example
 * return (
 *   <NavigationLink
 *     to="/home"
 *     bg="#00fffc"
 *     text="Home"
 *     textColor="black"
 *     onClick={async () => console.log('clicked')}
 *   />
 * )
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
