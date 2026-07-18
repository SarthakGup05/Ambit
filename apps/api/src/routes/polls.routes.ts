import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import { getPolls, votePoll } from "../controllers/polls.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 🗳️ Get all society polls
 */
router.get("/", getPolls);

/**
 * 🗳️ Cast a vote on a poll option
 */
router.post("/:id/vote", votePoll);

export default router;
