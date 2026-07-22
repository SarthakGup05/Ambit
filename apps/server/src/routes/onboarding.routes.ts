import { Router } from "express";
import { authenticate } from "../middleware/tenant.middleware.js";
import {
  adminOnboard,
  residentOnboard,
  guardOnboard,
} from "../controllers/onboarding.controller.js";

const router = Router();

/**
 * 🏢 Admin Onboarding
 * Registers a new society and sets the authenticated user as the admin.
 */
router.post("/admin", authenticate, adminOnboard);

/**
 * 👥 Resident Onboarding
 * Associates the authenticated user with a society using an invite code.
 */
router.post("/resident", authenticate, residentOnboard);

/**
 * 🛡️ Guard Onboarding (Admin Only)
 * Creates a new guard account programmatically and associates it with the admin's society.
 */
router.post("/guard", authenticate, guardOnboard);

export default router;
