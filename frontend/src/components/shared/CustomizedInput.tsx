/**
 * CustomizedInput Component
 * 
 * A reusable input component that provides:
 * - Consistent styling across the application
 * - Material-UI integration
 * - Type-safe props
 * - Customizable appearance
 * 
 * Built on top of Material-UI's TextField component with
 * predefined styling and simplified props interface.
 * 
 * @module Components/Shared/CustomizedInput
 */

import React from "react";
import TextField from "@mui/material/TextField";

/**
 * CustomizedInput Props Interface
 * 
 * @typedef {Object} CustomizedInputProps
 * @property {string} name - Input field name attribute
 * @property {string} type - Input type (e.g., 'text', 'password', 'email')
 * @property {string} label - Label text displayed above input
 */
type CustomizedInputProps = {
  name: string;     // Name attribute for the input field
  type: string;     // Type of input (text, password, etc)
  label: string;    // Label text to display
};

/**
 * Style Configuration
 * 
 * Defines consistent styling for the input component:
 * - Label appearance
 * - Input field dimensions and appearance
 * - Text styling
 * 
 * Uses Material-UI's styling system for theme consistency
 */
const INPUT_STYLES = {
  label: {
    color: "white" // Label color for visibility
  },
  input: {
    width: "400px",        // Fixed width for consistency
    borderRadius: 10,      // Rounded corners
    fontSize: 20,          // Readable font size
    color: "white"         // Text color for visibility
  }
} as const;

/**
 * CustomizedInput Component
 * 
 * A styled input field that:
 * - Integrates with Material-UI's TextField
 * - Provides consistent styling
 * - Supports different input types
 * - Maintains accessibility
 * 
 * @component
 * @example
 * return (
 *   <CustomizedInput
 *     name="email"
 *     type="email"
 *     label="Email Address"
 *   />
 * )
 */
const CustomizedInput: React.FC<CustomizedInputProps> = ({ 
  name, 
  type, 
  label 
}) => {
  return (
    <TextField
      margin="normal"
      sx={{
        // Style label component
        '& .MuiInputLabel-root': INPUT_STYLES.label,
        // Style input field
        '& .MuiInputBase-input': INPUT_STYLES.input,
        // Container styling
        width: INPUT_STYLES.input.width,
        borderRadius: INPUT_STYLES.input.borderRadius
      }}
      // Input attributes
      name={name}
      label={label} 
      type={type}
      // Ensure proper accessibility
      aria-label={label}
    />
  );
};

export default CustomizedInput;
