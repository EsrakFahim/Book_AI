// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "./Configs/cors.config.js";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Environment setup
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(cors);
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes (add real ones here)

// Error Handling
import { errorMiddleware } from "./Middleware/error.js";
app.use(errorMiddleware);

app.use((req, res) => {
      res.status(404).json({ message: "Route Not Found" });
});

export { app };
