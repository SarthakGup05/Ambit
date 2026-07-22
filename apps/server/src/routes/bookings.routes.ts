import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import {
  getAmenities,
  getBookings,
  createBooking,
  updateBookingStatus,
} from "../controllers/bookings.controller.js";

const router = Router();

// Apply session verification and tenant check to all endpoints
router.use(authenticate, requireSociety);

/**
 * 🏢 Get all society amenities
 */
router.get("/amenities", getAmenities);

/**
 * 🗓️ Get bookings
 */
router.get("/", getBookings);

/**
 * ✍️ Create a new booking
 */
router.post("/", createBooking);

/**
 * 🔄 Update booking status (cancel/confirm)
 */
router.patch("/:id", updateBookingStatus);

export default router;
