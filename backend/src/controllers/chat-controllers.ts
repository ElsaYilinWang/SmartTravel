import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import {
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
  OpenAIApi,
} from "openai";

/**
 * Generates a chat completion using OpenAI API
 * Takes user message, adds to chat history, gets AI response and saves
 */
export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;

  try {
    // Verify user exists and is authenticated
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    // Format chat history for OpenAI API
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    
    // Add new user message
    const newMessage = { content: message, role: "user" } as ChatCompletionRequestMessage;
    chats.push(newMessage);
    user.chats.push(newMessage);


    // Get AI response
    const openai = new OpenAIApi(configureOpenAI());
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: chats,
    });

    // Save AI response to user's chat history
    const aiMessage = chatResponse.data.choices[0].message as ChatCompletionResponseMessage;
    user.chats.push(aiMessage);
    await user.save();

    return res.status(200).json({ chats: user.chats });
  } catch (error) {
    console.error('Chat completion error:', error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Retrieves chat history for authenticated user
 * Verifies user permissions before returning chats
 */
export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR token malfunctioned.");
    }

    // Verify user has permission to access these chats
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission didn't match.");
    }

    return res.status(200).json({
      message: "OK",
      chats: user.chats,
    });
  } catch (error: any) {
    console.error('Error retrieving chats:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};

/**
 * Deletes all chats for authenticated user
 * Verifies user permissions before clearing chat history
 */
export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .send("User not registered OR token malfunctioned.");
    }

    // Verify user has permission to delete these chats
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permission didn't match.");
    }

    // Clear chat history
    user.chats = [] as any;
    await user.save();

    return res.status(200).json({
      message: "OK"
    });
  } catch (error: any) {
    console.error('Error deleting chats:', error);
    return res.status(404).json({ message: "ERROR", cause: error.message });
  }
};
