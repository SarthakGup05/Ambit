import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import { getPolls, votePoll, createPoll, deletePoll } from "../controllers/polls.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 🗳️ Get all society polls
 */
router.get("/", getPolls);

/**
 * 🗳️ Create a new community poll
 */
router.post("/", createPoll);

/**
 * 🗳️ Cast a vote on a poll option
 */
router.post("/:id/vote", votePoll);

/**
 * 🗳️ Delete a community poll
 */
router.delete("/:id", deletePoll);

export default router;
