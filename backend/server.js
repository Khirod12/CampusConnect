require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("CampusConnect Backend Running 🚀");
});

/* ================= DATABASE ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("MongoDB Error:", err));

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
