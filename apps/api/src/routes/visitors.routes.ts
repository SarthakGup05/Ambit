import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import { getFlatVisitors, updateVisitorStatus } from "../controllers/visitors.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 📋 Get visitor entry requests for the current resident's flat
 */
router.get("/flat", getFlatVisitors);

/**
 * 🔄 Approve or Deny an incoming visitor
 */
router.patch("/:id/status", updateVisitorStatus);

export default router;
