import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import { getResidentGuestPasses, createGuestPass } from "../controllers/guest-passes.controller.js";

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

export default router;
