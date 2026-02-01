import express from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Non-vehicle admin routes can be added here

export default router;
