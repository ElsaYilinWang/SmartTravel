/**
 * Chat API Integration Tests
 * Tests the complete flow of chat-related operations including:
 * - Sending messages
 * - Retrieving chat history
 * - Clearing conversations
 * - Authentication requirements
 */

import request from 'supertest';
import { app } from '../../app';
import User from '../../models/User';
import mongoose from 'mongoose';

describe('Chat Integration Tests', () => {
  let authCookie: string;
  let userId: string;
  
  // Test user data
  const testUser = {
    name: 'Chat Test User',
    email: 'chattest@example.com',
    password: 'password123'
  };

  /**
   * Test Setup
   * Before all tests:
   * 1. Create test user
   * 2. Login to get authentication cookie
   */
  beforeAll(async () => {
    // Clear any existing test user
    await User.deleteMany({ email: testUser.email });
    
    // Create test user
    const signupResponse = await request(app)
      .post('/api/v1/user/signup')
      .send(testUser);
      
    userId = signupResponse.body.id;
    
    // Login to get auth cookie
    const loginResponse = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
      
    // Extract auth cookie
    const cookies = loginResponse.headers['set-cookie'];
    authCookie = cookies[0].split(';')[0];
  });
  
  /**
   * Test Cleanup
   * After all tests:
   * 1. Remove test user and associated data
   */
  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
  });

  describe('Chat Message Operations', () => {
    /**
     * Test: Send New Chat Message
     * Verifies that:
     * 1. Message is sent successfully
     * 2. Response contains updated chat history
     * 3. User's chat history is updated in database
     */
    it('should send a new chat message and receive response', async () => {
      const message = 'What are some good places to visit in Paris?';
      
      const response = await request(app)
        .post('/api/v1/chat/new')
        .set('Cookie', [authCookie])
        .send({ message });
        
      expect(response.status).toBe(200);
      expect(response.body.chats).toBeDefined();
      expect(Array.isArray(response.body.chats)).toBe(true);
      
      // Verify user message is in the response
      const userMessages = response.body.chats.filter(
        (chat: any) => chat.role === 'user' && chat.content === message
      );
      expect(userMessages.length).toBeGreaterThan(0);
      
      // Verify assistant response is included
      const assistantResponses = response.body.chats.filter(
        (chat: any) => chat.role === 'assistant'
      );
      expect(assistantResponses.length).toBeGreaterThan(0);
      
      // Verify database update
      const user = await User.findById(userId);
      expect(user!.chats.length).toBeGreaterThan(0);
      
      // Find the user message in the database
      const dbUserMessage = user!.chats.find(
        chat => chat.role === 'user' && chat.content === message
      );
      expect(dbUserMessage).toBeDefined();
    });
    
    /**
     * Test: Get Chat History
     * Verifies that:
     * 1. Chat history is retrieved successfully
     * 2. Response contains all user messages
     */
    it('should retrieve user chat history', async () => {
      const response = await request(app)
        .get('/api/v1/chat/all')
        .set('Cookie', [authCookie]);
        
      expect(response.status).toBe(200);
      expect(response.body.chats).toBeDefined();
      expect(Array.isArray(response.body.chats)).toBe(true);
      
      // Verify chat history matches database
      const user = await User.findById(userId);
      expect(response.body.chats.length).toBe(user!.chats.length);
    });
    
    /**
     * Test: Clear Chat History
     * Verifies that:
     * 1. Chat history is cleared successfully
     * 2. Database is updated to reflect empty chat history
     */
    it('should clear chat history', async () => {
      // First, ensure we have some chat history
      const message = 'This message will be deleted';
      await request(app)
        .post('/api/v1/chat/new')
        .set('Cookie', [authCookie])
        .send({ message });
      
      // Now clear the chat history
      const response = await request(app)
        .delete('/api/v1/chat/clear')
        .set('Cookie', [authCookie]);
        
      expect(response.status).toBe(200);
      
      // Verify database update
      const user = await User.findById(userId);
      expect(user!.chats.length).toBe(0);
      
      // Verify get chats returns empty array
      const getChatsResponse = await request(app)
        .get('/api/v1/chat/all')
        .set('Cookie', [authCookie]);
        
      expect(getChatsResponse.body.chats.length).toBe(0);
    });
  });
  
  describe('Chat Authentication and Error Handling', () => {
    /**
     * Test: Unauthenticated Chat Access
     * Verifies that:
     * 1. Chat endpoints reject unauthenticated requests
     * 2. Appropriate error response is returned
     */
    it('should reject chat operations without authentication', async () => {
      // Try to send message without auth
      const sendResponse = await request(app)
        .post('/api/v1/chat/new')
        .send({ message: 'Unauthenticated message' });
        
      expect(sendResponse.status).toBe(401);
      
      // Try to get chats without auth
      const getResponse = await request(app)
        .get('/api/v1/chat/all');
        
      expect(getResponse.status).toBe(401);
      
      // Try to clear chats without auth
      const clearResponse = await request(app)
        .delete('/api/v1/chat/clear');
        
      expect(clearResponse.status).toBe(401);
    });
    
    /**
     * Test: Invalid Message Format
     * Verifies that:
     * 1. Invalid message format is rejected
     * 2. Appropriate error response is returned
     */
    it('should validate message format', async () => {
      // Send empty message
      const emptyResponse = await request(app)
        .post('/api/v1/chat/new')
        .set('Cookie', [authCookie])
        .send({ message: '' });
        
      expect(emptyResponse.status).toBe(400);
      
      // Send message with wrong format
      const invalidResponse = await request(app)
        .post('/api/v1/chat/new')
        .set('Cookie', [authCookie])
        .send({ wrongField: 'This is not the right field name' });
        
      expect(invalidResponse.status).toBe(400);
    });
    
    /**
     * Test: Error Handling for API Failures
     * Verifies that:
     * 1. API errors are handled gracefully
     * 2. Appropriate error response is returned
     */
    it('should handle API errors gracefully', async () => {
      // This test would typically mock the AI service to simulate failures
      // For this example, we're testing the endpoint with an extremely long message
      // that might cause issues with the underlying AI service
      
      const veryLongMessage = 'a'.repeat(10000); // Extremely long message
      
      const response = await request(app)
        .post('/api/v1/chat/new')
        .set('Cookie', [authCookie])
        .send({ message: veryLongMessage });
        
      // The exact status code depends on how the API handles this case
      // It could be 400 (bad request) or 500 (server error)
      expect([400, 500]).toContain(response.status);
    });
  });
});
