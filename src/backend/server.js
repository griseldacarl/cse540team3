// This is the main backend server file
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const initDb = require("./initDb");
const businessRoutes = require("./routes/businesses");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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