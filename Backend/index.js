import cors from "cors";
import "dotenv/config";
import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", adminRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AutoRent Backend API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

