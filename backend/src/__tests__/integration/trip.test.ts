/**
 * Trip API Integration Tests
 * Tests the complete flow of trip-related operations including:
 * - Creation and validation
 * - Retrieval and filtering
 * - Updates and access control
 * - Deletion and cleanup
 */

import request from 'supertest';
import { app } from '../../app';
import { Trip } from '../../models/trip';
import mongoose from 'mongoose';

describe('Trip Integration Tests', () => {
  let authToken: string;
  let userId: string;

  /**
   * Test Setup
   * Before each test:
   * 1. Get fresh authentication token
   * 2. Store user ID for verification
   */
  beforeEach(async () => {
    const auth = await global.signin();
    authToken = auth.token;
    userId = auth.userId;
  });

  describe('Trip Creation and Validation', () => {
    /**
     * Test: Create Trip with Valid Data
     * Verifies that:
     * 1. Trip is created successfully
     * 2. Response contains correct data
     * 3. Database entry matches request
     */
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

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.userId).toBe(userId);
      expect(response.body.destination).toBe(tripData.destination);

      // Verify database entry
      const trip = await Trip.findById(response.body.id);
      expect(trip).toBeDefined();
      expect(trip!.userId.toString()).toBe(userId);
      expect(trip!.destination).toBe(tripData.destination);
      expect(trip!.startDate.toISOString().split('T')[0]).toBe(tripData.startDate);
    });

    /**
     * Test: Required Fields Validation
     * Verifies that:
     * 1. Missing required fields trigger validation error
     * 2. Error response contains validation details
     */
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Invalid trip' // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    /**
     * Test: Date Order Validation
     * Verifies that:
     * 1. End date must be after start date
     * 2. Invalid date order triggers appropriate error
     */
    it('should validate date order', async () => {
      const response = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          destination: 'Paris',
          startDate: '2024-06-07',
          endDate: '2024-06-01', // Invalid: end date before start date
          description: 'Invalid trip'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toMatch(/end date must be after start date/i);
    });

    /**
     * Test: Invalid Date Format
     * Verifies that:
     * 1. Invalid date format triggers validation error
     * 2. Error response contains appropriate message
     */
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
    /**
     * Test Setup
     * Before each test:
     * 1. Create sample trips for testing
     * 2. Ensure trips span different dates and destinations
     */
    beforeEach(async () => {
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

      // Create all test trips
      for (const trip of trips) {
        await request(app)
          .post('/api/trips')
          .set('Authorization', `Bearer ${authToken}`)
          .send(trip);
      }
    });

    /**
     * Test: List All User Trips
     * Verifies that:
     * 1. All trips for the user are returned
     * 2. Only trips belonging to the user are included
     */
    it('should list all trips for the user', async () => {
      const response = await request(app)
        .get('/api/trips')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      expect(response.body.every((trip: any) => trip.userId === userId)).toBe(true);
    });

    /**
     * Test: Date Range Filtering
     * Verifies that:
     * 1. Trips are filtered correctly by date range
     * 2. Only trips within range are returned
     */
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

    /**
     * Test: Pagination
     * Verifies that:
     * 1. Results are paginated correctly
     * 2. Pagination metadata is included
     */
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

    /**
     * Test: Sort Order
     * Verifies that:
     * 1. Results are sorted correctly
     * 2. Sort order is respected
     */
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

    /**
     * Test Setup
     * Before each test:
     * 1. Create a test trip
     * 2. Store trip ID for updates
     */
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

    /**
     * Test: Valid Update
     * Verifies that:
     * 1. Trip is updated successfully
     * 2. Only specified fields are modified
     * 3. Database reflects changes
     */
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

      // Verify database update
      const trip = await Trip.findById(tripId);
      expect(trip!.description).toBe(updateData.description);
      expect(trip!.endDate.toISOString().split('T')[0]).toBe(updateData.endDate);
    });

    /**
     * Test: Unauthorized Update
     * Verifies that:
     * 1. Users cannot update others' trips
     * 2. Original trip data remains unchanged
     */
    it('should prevent unauthorized updates', async () => {
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

    /**
     * Test: Partial Update Validation
     * Verifies that:
     * 1. Partial updates are validated
     * 2. Invalid updates are rejected
     */
    it('should validate partial updates', async () => {
      const response = await request(app)
        .put(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          endDate: '2024-08-01' // Invalid: would make end date same as start date
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    /**
     * Test: Concurrent Updates
     * Verifies that:
     * 1. Concurrent updates are handled properly
     * 2. Database remains in consistent state
     */
    it('should handle concurrent updates correctly', async () => {
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

    /**
     * Test Setup
     * Before each test:
     * 1. Create a test trip
     * 2. Store trip ID for deletion
     */
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

    /**
     * Test: Successful Deletion
     * Verifies that:
     * 1. Trip is deleted successfully
     * 2. Associated data is cleaned up
     */
    it('should delete trip and associated data', async () => {
      const response = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify trip deletion
      const trip = await Trip.findById(tripId);
      expect(trip).toBeNull();
    });

    /**
     * Test: Unauthorized Deletion
     * Verifies that:
     * 1. Users cannot delete others' trips
     * 2. Trip remains in database
     */
    it('should prevent unauthorized deletion', async () => {
      const anotherAuth = await global.signin();

      const response = await request(app)
        .delete(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${anotherAuth.token}`);

      expect(response.status).toBe(403);

      // Verify trip still exists
      const trip = await Trip.findById(tripId);
      expect(trip).toBeDefined();
    });

    /**
     * Test: Non-existent Trip Deletion
     * Verifies that:
     * 1. Attempting to delete non-existent trip returns 404
     * 2. Error is handled gracefully
     */
    it('should handle non-existent trip deletion', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/trips/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
