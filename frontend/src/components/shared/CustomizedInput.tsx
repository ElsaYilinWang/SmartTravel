import React from "react";
import TextField from "@mui/material/TextField";

// Define prop types for the input component
type CustomizedInputProps = {
  name: string;     // Name attribute for the input field
  type: string;     // Type of input (text, password, etc)
  label: string;    // Label text to display
};

// Styles object to keep styling consistent and maintainable
const INPUT_STYLES = {
  label: {
    color: "white"
  },
  input: {
    width: "400px",
    borderRadius: 10,
    fontSize: 20,
    color: "white"
  }
} as const;

/**
 * CustomizedInput component that wraps Material-UI TextField
 * with consistent styling and simplified props
 */
const CustomizedInput: React.FC<CustomizedInputProps> = ({ name, type, label }) => {
  return (
    <TextField
      margin="normal"
      // Style the input label and field using sx prop
      sx={{
        '& .MuiInputLabel-root': INPUT_STYLES.label,
        '& .MuiInputBase-input': INPUT_STYLES.input,
        width: INPUT_STYLES.input.width,
        borderRadius: INPUT_STYLES.input.borderRadius
      }}
      // Pass through required props
      name={name}
      label={label} 
      type={type}
    />
  );
};

export default CustomizedInput;
