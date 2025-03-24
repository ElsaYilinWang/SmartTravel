/**
 * Authentication Integration Tests
 * Tests the complete flow of user authentication including:
 * - User registration
 * - Login and token generation
 * - Authentication verification
 * - Logout and session management
 */

import request from 'supertest';
import { app } from '../../app';
import User from '../../models/User';
import mongoose from 'mongoose';
import { COOKIE_NAME } from '../../utils/constants';

describe('Authentication Integration Tests', () => {
  // Test user data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  // Clear test data before each test
  beforeEach(async () => {
    await User.deleteMany({ email: testUser.email });
  });

  describe('User Registration', () => {
    /**
     * Test: Register New User
     * Verifies that:
     * 1. User is created successfully
     * 2. Response contains correct user data
     * 3. Password is not returned in response
     */
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(testUser);

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.id).toBeDefined();
      expect(response.body.password).toBeUndefined();

      // Verify database entry
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeDefined();
      expect(user!.name).toBe(testUser.name);
      expect(user!.email).toBe(testUser.email);
      expect(user!.password).not.toBe(testUser.password); // Password should be hashed
    });

    /**
     * Test: Duplicate Email Registration
     * Verifies that:
     * 1. Registration with existing email fails
     * 2. Appropriate error response is returned
     */
    it('should reject registration with existing email', async () => {
      // Create initial user
      await request(app)
        .post('/api/v1/user/signup')
        .send(testUser);

      // Attempt to register with same email
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(testUser);

      expect(response.status).toBe(401);
      expect(response.text).toBe('User already exists');
    });

    /**
     * Test: Validation for Required Fields
     * Verifies that:
     * 1. Missing required fields trigger validation error
     * 2. Error response contains validation details
     */
    it('should validate required fields during registration', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send({
          name: 'Test User',
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('User Login and Authentication', () => {
    // Create test user before login tests
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/user/signup')
        .send(testUser);
    });

    /**
     * Test: User Login
     * Verifies that:
     * 1. User can login with correct credentials
     * 2. Authentication cookie is set
     * 3. User data is returned in response
     */
    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      
      // Verify authentication cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain(COOKIE_NAME);
    });

    /**
     * Test: Login with Invalid Credentials
     * Verifies that:
     * 1. Login fails with incorrect password
     * 2. Appropriate error response is returned
     */
    it('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(403);
      expect(response.text).toBe('Incorrect password');
    });

    /**
     * Test: Login with Non-existent User
     * Verifies that:
     * 1. Login fails for non-registered email
     * 2. Appropriate error response is returned
     */
    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        });

      expect(response.status).toBe(401);
      expect(response.text).toBe('User not registered');
    });
  });

  describe('Authentication Verification and Logout', () => {
    let authCookie: string;

    // Login and get authentication cookie before tests
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/v1/user/signup')
        .send(testUser);

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
     * Test: Verify Authentication Status
     * Verifies that:
     * 1. Auth status endpoint returns user data for authenticated user
     * 2. Response contains correct user information
     */
    it('should verify authentication status for logged in user', async () => {
      const response = await request(app)
        .get('/api/v1/user/auth-status')
        .set('Cookie', [authCookie]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User verified');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
    });

    /**
     * Test: Reject Unauthenticated Access
     * Verifies that:
     * 1. Auth status endpoint rejects requests without valid cookie
     * 2. Appropriate error response is returned
     */
    it('should reject unauthenticated access to protected routes', async () => {
      const response = await request(app)
        .get('/api/v1/user/auth-status');

      expect(response.status).toBe(401);
    });

    /**
     * Test: User Logout
     * Verifies that:
     * 1. Logout endpoint clears authentication cookie
     * 2. User session is terminated
     */
    it('should logout user and clear authentication cookie', async () => {
      const response = await request(app)
        .get('/api/v1/user/logout')
        .set('Cookie', [authCookie]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
      
      // Verify cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies[0]).toContain(`${COOKIE_NAME}=;`);
      
      // Verify auth status after logout
      const authStatusResponse = await request(app)
        .get('/api/v1/user/auth-status')
        .set('Cookie', [authCookie]);
        
      expect(authStatusResponse.status).toBe(401);
    });
  });
});
