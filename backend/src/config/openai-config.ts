import { Configuration } from "openai";

/**
 * Configures and returns an OpenAI API configuration object
 * Uses environment variables for secure credential management
 * 
 * @returns {Configuration} OpenAI configuration with API key and org ID
 * @throws {Error} If required environment variables are missing
 */
export const configureOpenAI = (): Configuration => {
  // Validate required environment variables exist
  if (!process.env.OPEN_AI_SECRET) {
    throw new Error('OpenAI API key is required but not configured');
  }

  if (!process.env.OPEN_AI_ORGANIZATION_ID) {
    throw new Error('OpenAI Organization ID is required but not configured');
  }

  // Create and return configuration with credentials
  return new Configuration({
    apiKey: process.env.OPEN_AI_SECRET,
    organization: process.env.OPEN_AI_ORGANIZATION_ID,
  });
};
