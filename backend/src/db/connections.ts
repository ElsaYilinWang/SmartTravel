import { connect, disconnect } from 'mongoose';

/**
 * Establishes connection to MongoDB using the URL from environment variables
 * Handles connection errors and provides detailed error messages
 * @throws Error if connection fails
 */
async function connectToDatabase() {
    try {
        // Connect with unified topology and retry writes enabled
        await connect(process.env.MONGODB_URL as string, {
            // Auto create indexes in development, disable in production
            autoIndex: process.env.NODE_ENV !== 'production',
            // Retry failed operations
            retryWrites: true,
            // Wait up to 5 seconds before timing out
            connectTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        // Log the full error for debugging
        console.error('MongoDB connection error:', error);
        throw new Error('Failed to connect to MongoDB. Please check your connection string and network connectivity.');
    }
}

/**
 * Safely closes the MongoDB connection
 * Important for clean application shutdown
 * @throws Error if disconnection fails
 */
async function disconnectFromDatabase() {
    try {
        await disconnect();
        console.log('Successfully disconnected from MongoDB');
    } catch (error) {
        console.error('MongoDB disconnection error:', error);
        throw new Error('Failed to disconnect from MongoDB cleanly.');
    }
}

export { connectToDatabase, disconnectFromDatabase };