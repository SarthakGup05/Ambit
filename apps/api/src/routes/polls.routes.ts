import { Router } from "express";
import { authenticate, requireSociety, requireAdmin } from "../middleware/tenant.middleware.js";
import { getPolls, createPoll, deletePoll } from "../controllers/polls.controller.js";

const router = Router();

/**
 * 🗳️ Fetch all polls (Residents & Admins)
 */
router.get("/", authenticate, requireSociety, getPolls);

/**
 * ✍️ Create a poll (Admin Only)
 */
router.post("/", authenticate, requireSociety, requireAdmin, createPoll);

/**
 * 🗑️ Delete a poll (Admin Only)
 */
router.delete("/:id", authenticate, requireSociety, requireAdmin, deletePoll);

export default router;
