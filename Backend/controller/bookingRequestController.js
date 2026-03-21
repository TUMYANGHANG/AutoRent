import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../schema/index.js";
import {
  approveRequest,
  cancelRequest,
  createRequest,
  getMyRequests,
  getRequestById,
  getRequestsForOwner,
  rejectRequest,
} from "../services/bookingRequestService.js";
import {
  createNotification,
  getUserById,
  NOTIFICATION_TYPES,
} from "../services/notificationService.js";

const ensureVerifiedRenter = async (req, res, next) => {
  const { userId, role } = req.user;
  if (role !== "renter") {
    return res.status(403).json({
      success: false,
      message: "Only renters can create booking requests",
    });
  }
  const [user] = await db
    .select({ isProfileVerified: users.isProfileVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user?.isProfileVerified) {
    return res.status(403).json({
      success: false,
      message:
        "Complete your profile and get it verified by admin before you can request vehicles.",
    });
  }
  next();
};

const createRequestController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { vehicleId, startDate, returnDate, pickupPlace, dropoffPlace, notes } = req.body;

    if (!vehicleId || !startDate || !returnDate || !pickupPlace) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, startDate, returnDate, and pickupPlace are required",
      });
    }

    const result = await createRequest(userId, {
      vehicleId,
      startDate,
      returnDate,
      pickupPlace,
      dropoffPlace,
      notes,
    });

    if (!result) {
      return res.status(500).json({ success: false, message: "Failed to create request" });
    }

    const renter = await getUserById(userId);
    const renterName = renter
      ? `${renter.firstName || ""} ${renter.lastName || ""}`.trim() || renter.email
      : "A renter";
    const vehicleName = `${result.vehicle.brand} ${result.vehicle.model}`;

    await createNotification({
      recipientUserId: result.request.ownerId,
      type: NOTIFICATION_TYPES.BOOKING_REQUEST,
      title: "New booking request",
      message: `${renterName} requested to book your ${vehicleName} for ${result.request.startDate} to ${result.request.returnDate}.`,
      vehicleId: result.vehicle.id,
      actorUserId: userId,
    });

    res.status(201).json({
      success: true,
      message: "Request sent to the vehicle owner. You will be notified when they respond.",
      data: {
        request: result.request,
        vehicle: {
          id: result.vehicle.id,
          brand: result.vehicle.brand,
          model: result.vehicle.model,
        },
      },
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.code === "CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Create request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const approveRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const result = await approveRequest(id, userId, role);
    if (!result) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const owner = await getUserById(userId);
    const ownerName = owner
      ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || owner.email
      : "The owner";
    const vehicleName = `${result.vehicle.brand} ${result.vehicle.model}`;

    await createNotification({
      recipientUserId: result.booking.renterId,
      type: NOTIFICATION_TYPES.BOOKING_APPROVED,
      title: "Booking approved",
      message: `${ownerName} approved your booking request for ${vehicleName}. Pay at pickup when you collect the vehicle.`,
      vehicleId: result.vehicle.id,
      actorUserId: userId,
    });

    res.status(200).json({
      success: true,
      message: "Request approved. Booking confirmed.",
      data: {
        booking: result.booking,
        request: result.request,
        vehicle: {
          id: result.vehicle.id,
          brand: result.vehicle.brand,
          model: result.vehicle.model,
        },
      },
    });
  } catch (error) {
    if (error.code === "INVALID_STATE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === "CONFLICT") {
      return res.status(409).json({ success: false, message: error.message });
    }
    console.error("Approve request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const rejectRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body || {};
    const userId = req.user.userId;
    const role = req.user.role;

    const updated = await rejectRequest(id, userId, role, rejectionReason);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const owner = await getUserById(userId);
    const ownerName = owner
      ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim() || owner.email
      : "The owner";

    await createNotification({
      recipientUserId: updated.renterId,
      type: NOTIFICATION_TYPES.BOOKING_REJECTED,
      title: "Booking request declined",
      message: `${ownerName} declined your booking request${rejectionReason ? `: ${rejectionReason}` : "."}`,
      vehicleId: updated.vehicleId,
      actorUserId: userId,
    });

    res.status(200).json({
      success: true,
      message: "Request rejected",
      data: updated,
    });
  } catch (error) {
    if (error.code === "INVALID_STATE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Reject request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const cancelRequestController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const updated = await cancelRequest(id, userId, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Request cancelled",
      data: updated,
    });
  } catch (error) {
    if (error.code === "INVALID_STATE") {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Cancel request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getMyRequestsController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    if (role !== "renter") {
      return res.status(403).json({ success: false, message: "Only renters can view their requests" });
    }
    const list = await getMyRequests(userId);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRequestsForOwnerController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    if (role !== "owner" && role !== "admin") {
      return res.status(403).json({ success: false, message: "Only owners can view their requests" });
    }
    const list = await getRequestsForOwner(userId);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Get requests for owner error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getRequestByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;
    const request = await getRequestById(id, userId, role);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  approveRequestController,
  cancelRequestController,
  createRequestController,
  ensureVerifiedRenter,
  getMyRequestsController,
  getRequestByIdController,
  getRequestsForOwnerController,
  rejectRequestController,
};
