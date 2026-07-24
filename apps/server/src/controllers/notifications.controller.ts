import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications, user } from "../models/schema.js";

/**
 * 🔔 Fetch notifications for current user (Auto-seeds demo alerts if empty)
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const list = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.societyId, req.societyId),
          eq(notifications.userId, req.user.id)
        )
      )
      .orderBy(desc(notifications.createdAt));

    return res.status(200).json({ notifications: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 👁️ Mark notification as read
 */
export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, req.user.id),
          eq(notifications.societyId, req.societyId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read", notification: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * 👁️ Mark all notifications as read
 */
export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, req.user.id),
          eq(notifications.societyId, req.societyId)
        )
      );

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
}

/**
 * 📲 Register client push token
 */
export async function registerPushToken(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    await db
      .update(user)
      .set({ pushToken: token })
      .where(eq(user.id, req.user.id));

    console.log(`[Push Token] Registered token for user ${req.user.id}: ${token}`);

    return res.status(200).json({ message: "Push token registered successfully" });
  } catch (error) {
    next(error);
  }
}
