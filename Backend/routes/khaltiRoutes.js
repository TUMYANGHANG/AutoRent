import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiateKhaltiController,
  verifyKhaltiController,
} from "../controller/khaltiController.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/payments/khalti/initiate", initiateKhaltiController);
router.post("/payments/khalti/verify", verifyKhaltiController);

export default router;
