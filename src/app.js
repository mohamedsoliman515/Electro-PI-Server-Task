const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health check ---
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "TaskFlow API is running" });
});

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
