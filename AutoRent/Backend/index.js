import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { client } from "./db/index.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRequestRoutes from "./routes/bookingRequestRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import contactInquiryRoutes from "./routes/contactInquiryRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import garageRoutes from "./routes/garageRoutes.js";
import khaltiRoutes from "./routes/khaltiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import vehicleReviewRoutes from "./routes/vehicleReviewRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import { startBookingScheduler } from "./services/bookingScheduler.js";
import { verifyMailConnection } from "./services/emailService.js";
import { setNotificationSocket } from "./services/notificationService.js";
import { registerChatHandlers } from "./sockets/chatSocket.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", notificationRoutes);
app.use("/api", uploadRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", garageRoutes);
app.use("/api", bookingRoutes);
app.use("/api", bookingRequestRoutes);
app.use("/api", khaltiRoutes);
app.use("/api", stripeRoutes);
app.use("/api", vehicleReviewRoutes);
app.use("/api", contactInquiryRoutes);
app.use("/api", adminRoutes);
app.use("/api", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AutoRent Backend API is running" });
});

// Create HTTP server + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setNotificationSocket(io);

// Socket authentication using JWT (same secret as HTTP)
io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return next(new Error("Authentication error"));
      }
      socket.user = {
        userId: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    });
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  registerChatHandlers(io, socket);
});

// Start server
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await client`SELECT 1`;
    console.log("Database: connected");
  } catch (err) {
    console.error("Database: not connected -", err?.message || err);
  }

  try {
    await verifyMailConnection();
    console.log("SendGrid: ready");
  } catch (err) {
    console.error("SendGrid: not ready -", err?.message || err);
  }

  startBookingScheduler();
});

app.use(cors({
  origin: 'https://autorentfyp.vercel.app',
  credentials: true
}));
