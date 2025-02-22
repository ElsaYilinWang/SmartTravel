import app from "./app.js";
import { connectToDatabase } from "./src/db/connections.js";

// Get port from environment variables or use default 5000
// The port is used to configure the Express server to listen on a specific port
const PORT = process.env.PORT || 5000;

// Initialize server and database connection
// This function is responsible for starting the Express server and connecting to the MongoDB database
const startServer = async () => {
  try {
    // First connect to database
    // The database connection is established using the connectToDatabase function
    // This function is responsible for connecting to the database and handling any errors that may occur
    await connectToDatabase();
    
    // Once database is connected, start the Express server
    // The Express server is started using the app.listen method
    // The server is configured to listen on the port specified by the PORT environment variable
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} and connected to database`);
    });
  } catch (error) {
    // Log any errors during startup and exit process
    // If an error occurs during startup, the error is logged to the console and the process is exited with a non-zero status code
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
// The startServer function is called to start the server
startServer();
