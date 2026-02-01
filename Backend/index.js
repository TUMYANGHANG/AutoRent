import cors from "cors";
import "dotenv/config";
import express from "express";
import { client } from "./db/index.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import { verifyMailConnection } from "./services/emailService.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", uploadRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AutoRent Backend API is running" });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await client`SELECT 1`;
    console.log("Database: connected");
  } catch (err) {
    console.error("Database: not connected -", err?.message || err);
  }

  try {
    await verifyMailConnection();
    console.log("Nodemailer (SMTP): ready");
  } catch (err) {
    console.error("Nodemailer (SMTP): not ready -", err?.message || err);
  }
});

