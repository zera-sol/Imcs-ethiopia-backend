const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./configs/db.js");
const graduateRoutes = require("./routes/graduates.js");
const userRoutes = require("./routes/user.js");
const newsRoutes = require("./routes/news.js")

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/graduates", graduateRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the IMCS Ethiopia API");
});

module.exports = app;
