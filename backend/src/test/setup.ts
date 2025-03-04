import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import request from 'supertest';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let mongod: MongoMemoryServer;

// Define global type for test context
declare global {
  var signin: () => Promise<{ token: string; userId: string }>;
  var generateToken: (userId: string) => string;
}

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  
  // Create an in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }

  // Reset all mocks
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up after all tests are done
  await mongoose.connection.close();
  await mongod.stop();
});

// Helper function to generate JWT token
global.generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m'
  });
};

// Helper function to get authentication token
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
