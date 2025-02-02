import app from "./app.js";
import { connectToDatabase } from "./db/connections.js";

// Get port from environment variables or use default 5000
const PORT = process.env.PORT || 5000;

// Initialize server and database connection
const startServer = async () => {
  try {
    // First connect to database
    await connectToDatabase();
    
    // Once database is connected, start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} and connected to database`);
    });
  } catch (error) {
    // Log any errors during startup and exit process
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
