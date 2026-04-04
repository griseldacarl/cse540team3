// This is the main backend server file
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const initDb = require("./initDb");
const businessRoutes = require("./routes/businesses");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

/*
 * This file is the backend entry point. It loads configuration, prepares the Express app,
 * initializes shared middleware, waits for the database initialization to succeed, and only then
 * mounts the API routes and starts listening for requests. That startup order makes the
 * server fail immediately if its persistence layer is not ready instead of accepting requests in a
 * broken state.
 */

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB on startup
initDb()
  .then(() => {
    console.log("Database initialized successfully!");
    
    // Routes
    app.use("/api/businesses", businessRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
