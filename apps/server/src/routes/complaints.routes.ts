import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
  addComplaintComment,
} from "../controllers/complaints.controller.js";

const router = Router();

// Apply authentication & tenant check middleware to all complaint endpoints
router.use(authenticate, requireSociety);

/**
 * 📋 Get all complaints for the user's society
 */
router.get("/", getComplaints);

/**
 * ✍️ Raise a new complaint ticket
 */
router.post("/", createComplaint);

/**
 * 🔄 Update status of a complaint ticket
 */
router.patch("/:id/status", updateComplaintStatus);

/**
 * 💬 Add comment/response to a complaint ticket
 */
router.post("/:id/comments", addComplaintComment);

export default router;
