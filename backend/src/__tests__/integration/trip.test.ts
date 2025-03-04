import request from 'supertest';
import { app } from '../../app';
import { Trip } from '../../models/trip';
import mongoose from 'mongoose';

describe('Trip Integration Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Get fresh auth token before each test
    const auth = await global.signin();
    authToken = auth.token;
    userId = auth.userId;
  });

  describe('Trip Creation and Validation', () => {
    it('should create a trip with valid data', async () => {
      const tripData = {
        destination: 'Paris',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        description: 'Summer vacation in Paris'
      };

      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(userId);
      expect(response.body.destination).toBe(tripData.destination);

      // Verify trip in database
      const trip = await Trip.findById(response.body.id);
      expect(trip).toBeDefined();
      expect(trip!.userId.toString()).toBe(userId);
      expect(trip!.destination).toBe(tripData.destination);
      expect(trip!.startDate.toISOString().split('T')[0]).toBe(tripData.startDate);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          description: 'Invalid trip'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should validate date order', async () => {
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
      expect(response.body.errors[0].message).toMatch(/end date must be after start date/i);
    });

    it('should reject invalid dates', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Paris',
          startDate: 'invalid-date',
          endDate: '2024-06-07',
          description: 'Invalid trip'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Trip Retrieval and Filtering', () => {
    beforeEach(async () => {
      // Create test trips
      const trips = [
        {
          destination: 'Paris',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
          description: 'Summer in Paris'
        },
        {
          destination: 'London',
          startDate: '2024-07-01',
          endDate: '2024-07-07',
          description: 'London exploration'
        },
        {
          destination: 'Rome',
          startDate: '2024-08-01',
          endDate: '2024-08-07',
          description: 'Roman holiday'
        }
      ];

      for (const trip of trips) {
        await request(app)
          .post('/api/trips')
          .set('Authorization', `Bearer ${authToken}`)
          .send(trip);
      }
    });

    it('should list all trips for the user', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body.every((trip: any) => trip.userId === userId)).toBe(true);
    });

    it('should filter trips by date range', async () => {
      const response = await request(app)
        .get('/api/trips')
        .query({
          startDate: '2024-06-01',
          endDate: '2024-07-31'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].destination).toBe('Paris');
      expect(response.body[1].destination).toBe('London');
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/trips')
        .query({
          page: 1,
          limit: 2
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.trips).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalPages).toBe(2);
      expect(response.body.pagination.currentPage).toBe(1);
    });

    it('should sort trips by date', async () => {
      const response = await request(app)
        .get('/api/trips')
        .query({
          sortBy: 'startDate',
          order: 'desc'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body[0].destination).toBe('Rome');
      expect(response.body[2].destination).toBe('Paris');
    });
  });

  describe('Trip Updates and Access Control', () => {
    let tripId: string;

    beforeEach(async () => {
      // Create a trip for testing updates
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

    it('should update trip with valid data', async () => {
      const updateData = {
        description: 'Updated Roman holiday',
        endDate: '2024-08-10'
      };

      const response = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.endDate.split('T')[0]).toBe(updateData.endDate);

      // Verify update in database
      const trip = await Trip.findById(tripId);
      expect(trip!.description).toBe(updateData.description);
      expect(trip!.endDate.toISOString().split('T')[0]).toBe(updateData.endDate);
    });

    it('should prevent unauthorized updates', async () => {
      // Create another user
      const anotherAuth = await global.signin();

      const response = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${anotherAuth.token}`)
        .send({
          description: 'Trying to update someone else\'s trip'
        });

      expect(response.status).toBe(403);

      // Verify trip was not modified
      const trip = await Trip.findById(tripId);
      expect(trip!.description).toBe('Roman holiday');
    });

    it('should validate partial updates', async () => {
      const response = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endDate: '2024-08-01', // Invalid: would make end date same as start date
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle concurrent updates correctly', async () => {
      // Simulate concurrent updates
      const [res1, res2] = await Promise.all([
        request(app)
          .put(`/api/trips/${tripId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ description: 'Update 1' }),
        request(app)
          .put(`/api/trips/${tripId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ description: 'Update 2' })
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // Verify final state
      const trip = await Trip.findById(tripId);
      expect(['Update 1', 'Update 2']).toContain(trip!.description);
    });
  });

  describe('Trip Deletion', () => {
    let tripId: string;

    beforeEach(async () => {
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

    it('should delete trip and associated data', async () => {
      const response = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify trip is deleted
      const trip = await Trip.findById(tripId);
      expect(trip).toBeNull();

      // Verify associated data is cleaned up (if applicable)
      // Add checks for related data cleanup here
    });

    it('should prevent unauthorized deletion', async () => {
      // Create another user
      const anotherAuth = await global.signin();

      const response = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${anotherAuth.token}`);

      expect(response.status).toBe(403);

      // Verify trip still exists
      const trip = await Trip.findById(tripId);
      expect(trip).toBeDefined();
    });

    it('should handle non-existent trip deletion', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
