import request from 'supertest';
import { app } from '../../app';
import { Trip } from '../../models/trip';
import mongoose from 'mongoose';

describe('Trip Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Get fresh auth token before each test
    authToken = await global.signin();
  });

  describe('Trip Creation and Retrieval Flow', () => {
    it('should create a trip and retrieve it', async () => {
      // Create a trip
      const createResponse = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          description: 'Summer vacation in Paris'
        });

      expect(createResponse.status).toBe(201);
      const tripId = createResponse.body.id;

      // Verify trip was saved to database
      const trip = await Trip.findById(tripId);
      expect(trip).toBeDefined();
      expect(trip!.destination).toBe('Paris');

      // Retrieve the created trip
      const getResponse = await request(app)
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.destination).toBe('Paris');
      expect(getResponse.body.startDate).toBe('2024-06-01');
      expect(getResponse.body.endDate).toBe('2024-06-07');
    });

    it('should not create trip with invalid dates', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Paris',
          startDate: '2024-06-07',
          endDate: '2024-06-01', // End date before start date
          description: 'Invalid trip'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should not create trip without authentication', async () => {
      const response = await request(app)
        .post('/api/trips')
        .send({
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          description: 'Summer vacation in Paris'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Trip Listing and Filtering', () => {
    beforeEach(async () => {
      // Create test trips
      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          description: 'Summer in Paris'
        });

      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'London',
          startDate: '2024-07-01',
          endDate: '2024-07-07',
          description: 'London exploration'
        });
    });

    it('should list all trips for the user', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body.some((trip: any) => trip.destination === 'Paris')).toBe(true);
      expect(response.body.some((trip: any) => trip.destination === 'London')).toBe(true);
    });

    it('should filter trips by date range', async () => {
      const response = await request(app)
        .get('/api/trips')
        .query({ startDate: '2024-06-01', endDate: '2024-06-30' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].destination).toBe('Paris');
    });
  });

  describe('Trip Update and Delete Flow', () => {
    let tripId: string;

    beforeEach(async () => {
      // Create a trip for testing updates and deletes
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Rome',
          startDate: '2024-08-01',
          endDate: '2024-08-07',
          description: 'Roman holiday'
        });

      tripId = response.body.id;
    });

    it('should update a trip', async () => {
      const updateResponse = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Roman holiday',
          endDate: '2024-08-10'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.description).toBe('Updated Roman holiday');
      expect(updateResponse.body.endDate).toBe('2024-08-10');

      // Verify update in database
      const trip = await Trip.findById(tripId);
      expect(trip!.description).toBe('Updated Roman holiday');
      expect(trip!.endDate.toISOString().split('T')[0]).toBe('2024-08-10');
    });

    it('should not update trip of another user', async () => {
      // Create another user and get their token
      const anotherUserToken = await global.signin();

      const response = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({
          description: 'Trying to update someone else\'s trip'
        });

      expect(response.status).toBe(403);
    });

    it('should delete a trip', async () => {
      const deleteResponse = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);

      // Verify trip is deleted from database
      const trip = await Trip.findById(tripId);
      expect(trip).toBeNull();

      // Verify trip cannot be retrieved
      const getResponse = await request(app)
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should not delete trip of another user', async () => {
      // Create another user and get their token
      const anotherUserToken = await global.signin();

      const response = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`);

      expect(response.status).toBe(403);

      // Verify trip still exists
      const trip = await Trip.findById(tripId);
      expect(trip).toBeDefined();
    });
  });
});
