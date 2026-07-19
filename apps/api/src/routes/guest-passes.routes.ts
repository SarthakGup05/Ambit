import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import {
  getResidentGuestPasses,
  createGuestPass,
  verifyGuestPass,
} from "../controllers/guest-passes.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 🎫 Get active guest passes for the resident
 */
router.get("/", getResidentGuestPasses);

/**
 * ✍️ Generate a new guest pass
 */
router.post("/", createGuestPass);

/**
 * 🎟️ Verify guest pass QR token or 6-digit code (Guard feature)
 */
router.post("/verify", verifyGuestPass);

export default router;
