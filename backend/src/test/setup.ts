/**
 * Backend Test Setup Configuration
 * This file configures the testing environment for backend integration and unit tests.
 * It sets up the test database, authentication helpers, and global test utilities.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { app } from '../app';
import request from 'supertest';

// Load test environment variables
dotenv.config({ path: '.env.test' });

/**
 * Environment Configuration
 * Set test-specific environment variables
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

/**
 * Global Test Configuration
 * Extend the global object with test-specific utilities and helpers
 */
declare global {
  var signin: () => Promise<{ token: string; userId: string }>;
  var generateToken: (userId: string) => string;
}

/**
 * MongoDB Memory Server Instance
 * Used for running tests with an in-memory MongoDB instance
 * This prevents tests from affecting the actual database
 */
let mongod: MongoMemoryServer;

/**
 * Test Setup Hook
 * Runs before all tests
 * Sets up the in-memory MongoDB server and creates necessary connections
 */
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();

  // Connect Mongoose to the in-memory database
  await mongoose.connect(mongoUri);
});

/**
 * Database Cleanup Hook
 * Runs before each test
 * Cleans up all collections to ensure test isolation
 */
beforeEach(async () => {
  // Get all collections
  const collections = await mongoose.connection.db.collections();

  // Delete all documents from each collection
  for (let collection of collections) {
    await collection.deleteMany({});
  }

  // Reset all mocks
  jest.clearAllMocks();
});

/**
 * Test Teardown Hook
 * Runs after all tests
 * Closes database connections and stops the in-memory server
 */
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

/**
 * JWT Token Generator
 * Creates a signed JWT token for testing authentication
 * @param userId - The ID of the user to generate token for
 * @returns Signed JWT token
 */
global.generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m'
  });
};

/**
 * Test User Authentication Helper
 * Creates a test user and returns authentication token
 * @returns Object containing JWT token and user ID
 */
global.signin = async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

  return {
    token: response.body.token,
    userId: response.body.user.id
  };
};
