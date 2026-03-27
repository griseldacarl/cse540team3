const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function ensureDockerRunning() {
  try {
    // Check if Docker is responsive
    execSync("docker info", { stdio: "ignore" });
    console.log("Docker is running ✅");
  } catch (err) {
    console.log("Docker is not running. Attempting to start Docker...");

    try {
      if (process.platform === "win32") {
        // Start Docker Desktop on Windows
        execSync(
          'powershell -Command "Start-Process \\"C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe\\" -Verb runAs"',
          { stdio: "inherit" }
        );
        console.log("Docker Desktop starting... please wait a few seconds.");
      } else {
        // Linux/macOS
        execSync("sudo systemctl start docker", { stdio: "inherit" });
        console.log("Docker daemon started.");
      }

      // Wait a few seconds for Docker
      await new Promise((resolve) => setTimeout(resolve, 8000));
    } catch (startErr) {
      console.error("Failed to start Docker automatically:", startErr);
      process.exit(1);
    }
  }
}

async function waitForMysql(maxRetries = 15, delayMs = 3000) {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      const testConn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      await testConn.end();
      console.log("MySQL is ready ✅");
      return;
    } catch {
      retries--;
      console.log(`Waiting for MySQL to start... (${maxRetries - retries}/${maxRetries})`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error("MySQL did not become ready in time");
}

async function initDb() {
  let connection;
  try {
    // 1️⃣ Ensure Docker is running
    await ensureDockerRunning();

    // 2️⃣ Start Docker containers
    console.log("Starting Docker containers...");
    execSync("docker-compose up -d", { stdio: "inherit" });

    // 3️⃣ Wait for MySQL container
    await waitForMysql();

    // 4️⃣ Connect to MySQL (without DB yet)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true,
    });
    console.log("Connected to MySQL...");

    // 5️⃣ Execute schema.sql
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await connection.query(schema);

    console.log("Database initialized successfully! 🎉");
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

// Run directly
if (require.main === module) {
  initDb();
}

module.exports = initDb;