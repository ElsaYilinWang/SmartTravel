import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from '../app';

// Load test environment variables
dotenv.config({ path: '.env.test' });

let mongod: MongoMemoryServer;

// Define global type for test context
declare global {
  var signin: () => Promise<string>;
}

beforeAll(async () => {
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
});

afterAll(async () => {
  // Clean up after all tests are done
  await mongoose.connection.close();
  await mongod.stop();
});

// Helper function to get authentication token
global.signin = async () => {
  const response = await app.post('/api/auth/signup').send({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  });

  return response.body.token;
};
