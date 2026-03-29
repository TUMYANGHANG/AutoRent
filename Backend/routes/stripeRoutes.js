import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiateStripeController,
  verifyStripeController,
} from "../controller/stripeController.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/payments/stripe/initiate", initiateStripeController);
router.post("/payments/stripe/verify", verifyStripeController);

export default router;
