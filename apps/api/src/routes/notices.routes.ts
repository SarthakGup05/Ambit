import { Router } from "express";
import { authenticate, requireSociety, requireAdmin } from "../middleware/tenant.middleware.js";
import { getNotices, createNotice, deleteNotice } from "../controllers/notices.controller.js";

const router = Router();

/**
 * 📢 Fetch all notices (Residents & Admins)
 */
router.get("/", authenticate, requireSociety, getNotices);

/**
 * ✍️ Create a notice (Admin Only)
 */
router.post("/", authenticate, requireSociety, requireAdmin, createNotice);

/**
 * 🗑️ Delete a notice (Admin Only)
 */
router.delete("/:id", authenticate, requireSociety, requireAdmin, deleteNotice);

export default router;
