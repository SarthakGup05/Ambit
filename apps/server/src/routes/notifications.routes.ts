import { Router } from "express";
import { authenticate, requireSociety } from "../middleware/tenant.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  registerPushToken,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(authenticate, requireSociety);

/**
 * 🔔 Get user notifications
 */
router.get("/", getNotifications);

/**
 * 📲 Register client push token
 */
router.post("/register-token", registerPushToken);

/**
 * 👁️ Mark a specific notification as read
 */
router.patch("/:id/read", markAsRead);

/**
 * 👁️ Mark all notifications as read
 */
router.post("/read-all", markAllAsRead);

export default router;
