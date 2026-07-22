import { type Request, type Response, type NextFunction } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { notices } from "../models/schema.js";

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
