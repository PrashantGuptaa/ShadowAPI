const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const globalErrorHandler = require("./middlewares/errorHandler");
const requestLogger = require("./middlewares/requestLogger");
const { generalRateLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes");
const logger = require("./utils/logger");

const app = express();

// middlewares
app.use(express.json({ limit: "5mb" })); // or '10mb', '50mb'
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  cors({
    origin: [process.env.UI_URL, process.env.CHROME_EXTENSION_ID], // Allow requests from the UI URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);
// Add request logging middleware (includes payload size tracking)
app.use(requestLogger);

// Add general rate limiting to all routes
app.use("/api/v1", generalRateLimiter);
app.use("/api/v1", routes);

// Serve static files from /mock-json under the /cdn route
app.use("/cdn", express.static(path.join(__dirname, "public", "cdn")));

app.get("/", (req, res) => res.status(200).json({ message: "Welcome boss" }));

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3210;

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    logger.info("MongoDB connected successfully");
    app.listen(PORT, () => {
      logger.info("Server started successfully", {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
        version: require("./package.json").version || "1.0.0",
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed", { error: err });
    process.exit(1);
  });
