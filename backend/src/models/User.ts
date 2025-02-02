import { randomUUID } from "crypto";
import mongoose from "mongoose";

// Schema for individual chat messages
// Each chat has a unique ID, role (user/assistant), and message content
const chatSchema = new mongoose.Schema({
    id: {
        type: String,
        default: () => randomUUID(), // Use function to generate new UUID for each doc
        required: true,
        immutable: true // ID should never change once set
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant'] // Restrict role to valid values
    },
    content: {
        type: String,
        required: true,
        trim: true // Remove whitespace from ends
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Main user schema containing profile info and chat history
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2 // Name must be at least 2 chars
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, // Store emails in lowercase
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum password length
    },
    chats: [chatSchema] // Array of chat messages using chatSchema
}, {
    timestamps: true // Add timestamps to user documents
});

// Create indexes for frequently queried fields
userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);