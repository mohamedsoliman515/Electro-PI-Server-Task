require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas, then start the HTTP server.
// Fail fast if required env vars are missing.
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error(
    "Missing required environment variables: MONGO_URI and/or JWT_SECRET",
  );
  process.exit(1);
}
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
    );
  });
});
// Guard against unhandled promise rejections crashing silently.
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
