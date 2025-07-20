const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const requestTrackingMiddleware = require("./middlewares");
const routes = require("./routes");

const app = express();

// middlewares
app.use(express.json({ limit: "5mb" })); // or '10mb', '50mb'
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(
  cors({
    origin: [process.env.FE_APP_URL, process.env.CHROME_EXTENSION_ID], // Allow requests from the UI URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);
// add request tracking middleware
app.use(requestTrackingMiddleware);
app.use("/api/v1", routes);

// Serve static files from /mock-json under the /cdn route
app.use("/cdn", express.static(path.join(__dirname, "public", "cdn")));

app.get("/", (req, res) => res.status(200).json({ message: "Welcome boss" }));

const PORT = process.env.PORT || 3210;

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`App running on ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
