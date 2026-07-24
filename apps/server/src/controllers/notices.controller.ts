import { type Request, type Response, type NextFunction } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { notices, user, notifications } from "../models/schema.js";
import { sendBatchExpoPush, type ExpoPushMessage } from "../services/push.service.js";

/**
 * 📢 Get Notices
 * Retrieves all notices registered under the authenticated user's society.
 */
export async function getNotices(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const list = await db
      .select()
      .from(notices)
      .where(eq(notices.societyId, req.societyId))
      .orderBy(desc(notices.createdAt));

    return res.status(200).json({ notices: list });
  } catch (error) {
    next(error);
  }
}

/**
 * ✍️ Create Notice (Admin Only)
 * Publishes a new notice bulletin for the society.
 */
export async function createNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, content, category, isUrgent } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({ 
        error: "Title, description, content, and category are required" 
      });
    }

    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const [newNotice] = await db
      .insert(notices)
      .values({
        societyId: req.societyId,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category,
        authorId: req.user!.id,
        isUrgent: !!isUrgent,
      })
      .returning();

    if (!newNotice) {
      return res.status(500).json({ error: "Failed to create notice" });
    }

    // Fetch all residents of the society
    const residents = await db
      .select({ id: user.id, pushToken: user.pushToken })
      .from(user)
      .where(and(eq(user.societyId, req.societyId), eq(user.role, "resident")));

    if (residents.length > 0) {
      // 1. Create In-App Notifications
      const notificationRecords = residents.map((resident) => ({
        societyId: req.societyId!,
        userId: resident.id,
        title: `New Notice: ${newNotice.title}`,
        body: newNotice.description,
        isRead: false,
      }));

      try {
        await db.insert(notifications).values(notificationRecords);
      } catch (err) {
        console.error("Failed to insert in-app notifications:", err);
      }

      // 2. Send Push Notifications
      const pushMessages: ExpoPushMessage[] = residents
        .filter((resident) => resident.pushToken)
        .map((resident) => ({
          to: resident.pushToken!,
          sound: "default",
          title: `New Notice: ${newNotice.title}`,
          body: newNotice.description,
          data: { route: "/(resident)/(tabs)/notices", noticeId: newNotice.id },
        }));

      if (pushMessages.length > 0) {
        // Execute batch push in background
        sendBatchExpoPush(pushMessages).catch((err) =>
          console.error("Failed to send batch push notifications:", err)
        );
      }
    }

    return res.status(201).json({
      message: "Notice published successfully",
      notice: newNotice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗑️ Delete Notice (Admin Only)
 */
export async function deleteNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Notice ID is required" });
    }

    const [deletedNotice] = await db
      .delete(notices)
      .where(
        and(
          eq(notices.id, id),
          eq(notices.societyId, req.societyId)
        )
      )
      .returning();

    if (!deletedNotice) {
      return res.status(404).json({ error: "Notice not found or unauthorized" });
    }

    return res.status(200).json({
      message: "Notice deleted successfully",
      notice: deletedNotice,
    });
  } catch (error) {
    next(error);
  }
}
