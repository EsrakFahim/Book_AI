// index.js
import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./DB/db.js";

// Load environment variables
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

// Required env variables check
const requiredEnvVars = ["PORT", "DB_CONNECTION_URI"];
const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingVars.length) {
      console.error(`Missing required environment variables: ${missingVars.join(", ")}`);
      process.exit(1);
}

// Parse port safely and validate
const rawPort = process.env.PORT || "8000";
const PORT = parseInt(rawPort, 10);

if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
      console.error(`❌ Invalid PORT value: "${rawPort}". Please fix your .env file (no trailing semicolon)!`);
      process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = async (server) => {
      console.log("🛑 Gracefully shutting down...");
      try {
            server.close(() => {
                  console.log("✅ Server closed.");
                  process.exit(0);
            });
      } catch (err) {
            console.error("❌ Error during shutdown:", err);
            process.exit(1);
      }
};

// Exported for use in cluster.js
export const startServer = async () => {
      try {
            await connectDB();
            console.log("✅ Connected to the database");

            const server = app.listen(PORT, () => {
                  console.log(`🟢 Worker ${process.pid} is running on port ${PORT}`);
            });

            server.on("error", (err) => {
                  console.error("❌ Server listen error!", err);
                  process.exit(1);
            });

            process.on("SIGINT", () => gracefulShutdown(server));
            process.on("SIGTERM", () => gracefulShutdown(server));
            process.on("uncaughtException", (err) => {
                  console.error("❌ Uncaught Exception:", err);
                  gracefulShutdown(server);
            });
            process.on("unhandledRejection", (reason) => {
                  console.error("❌ Unhandled Rejection:", reason);
                  gracefulShutdown(server);
            });
      } catch (err) {
            console.error("❌ App initialization failed!", err);
            process.exit(1);
      }
};
