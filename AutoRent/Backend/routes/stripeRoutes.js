import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiateStripeController,
  verifyStripeController,
} from "../controller/stripeController.js";
import { validateStripeInitiate, validateStripeVerify } from "../middleware/validators/stripePaymentValidation.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/payments/stripe/initiate", validateStripeInitiate, initiateStripeController);
router.post("/payments/stripe/verify", validateStripeVerify, verifyStripeController);

export default router;
