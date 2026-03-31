import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import {
  approveRequestController,
  cancelRequestController,
  createRequestController,
  ensureVerifiedRenter,
  getMyRequestsController,
  getRequestByIdController,
  getRequestsForOwnerController,
  rejectRequestController,
} from "../controller/bookingRequestController.js";

const router = express.Router();
router.use(authenticateToken);

router.post("/booking-requests", ensureVerifiedRenter, createRequestController);
router.get("/booking-requests/owner", getRequestsForOwnerController); // owner: pending requests (must be before :id)
router.get("/booking-requests", getMyRequestsController); // renter: my requests
router.get("/booking-requests/:id", getRequestByIdController);
router.patch("/booking-requests/:id/approve", approveRequestController);
router.patch("/booking-requests/:id/reject", rejectRequestController);
router.patch("/booking-requests/:id/cancel", cancelRequestController);

export default router;
