import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (combined auth and user details routes)
app.use("/api", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AutoRent Backend API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

