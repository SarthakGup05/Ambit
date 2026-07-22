import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import {
  getFlatVisitors,
  getSocietyVisitors,
  getResidentDirectory,
  createGateVisitor,
  checkoutVisitor,
  updateVisitorStatus,
} from "../controllers/visitors.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 🛡️ Get society-wide visitors (Guard & Admin overview)
 */
router.get("/", getSocietyVisitors);

/**
 * 🏢 Get resident directory for Guard lookup
 */
router.get("/directory", getResidentDirectory);

/**
 * 📋 Get visitor entry requests for the current resident's flat
 */
router.get("/flat", getFlatVisitors);

/**
 * 🚪 Register visitor at gate (Guard feature)
 */
router.post("/", createGateVisitor);

/**
 * 🚪 Perform Gate Check-Out
 */
router.patch("/:id/checkout", checkoutVisitor);

/**
 * 🔄 Approve or Deny an incoming visitor
 */
router.patch("/:id/status", updateVisitorStatus);

export default router;
