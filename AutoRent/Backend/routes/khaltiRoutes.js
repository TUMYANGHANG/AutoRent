import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  initiateKhaltiController,
  verifyKhaltiController,
} from "../controller/khaltiController.js";
import { validateKhaltiInitiate, validateKhaltiVerify } from "../middleware/validators/khaltiPaymentValidation.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/payments/khalti/initiate", validateKhaltiInitiate, initiateKhaltiController);
router.post("/payments/khalti/verify", validateKhaltiVerify, verifyKhaltiController);

export default router;
