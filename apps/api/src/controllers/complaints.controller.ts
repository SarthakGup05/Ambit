import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { complaints, user } from "../models/schema.js";

/**
 * 🛠️ Get Society Complaints List
 */
export async function getComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const { status } = req.query;

    const queryConditions = [eq(complaints.societyId, req.societyId)];
    if (typeof status === "string" && status !== "all") {
      queryConditions.push(eq(complaints.status, status as any));
    }

    const list = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        description: complaints.description,
        status: complaints.status,
        category: complaints.category,
        priority: complaints.priority,
        comments: complaints.comments,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        residentId: complaints.residentId,
        residentName: user.name,
        flatNumber: user.flatNumber,
      })
      .from(complaints)
      .innerJoin(user, eq(complaints.residentId, user.id))
      .where(and(...queryConditions))
      .orderBy(desc(complaints.createdAt));

    const formattedList = list.map((item) => ({
      ...item,
      flatNumber: item.flatNumber || "A-1203",
      residentName: item.residentName || "Society Resident",
    }));

    return res.status(200).json({ complaints: formattedList });
  } catch (error) {
    next(error);
  }
}

/**
 * ✍️ Create a new Complaint Ticket
 */
export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication and society binding required" });
    }

    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: "Title, description, and category are required" });
    }

    const [newComplaint] = await db
      .insert(complaints)
      .values({
        societyId: req.societyId,
        residentId: req.user.id,
        title: title.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        priority: priority ? priority.toLowerCase() : "medium",
        status: "open",
        comments: [],
      })
      .returning();

    return res.status(201).json({
      message: "Complaint ticket created successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔄 Update Complaint Status
 */
export async function updateComplaintStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Complaint ID and status are required" });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const [updated] = await db
      .update(complaints)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(complaints.id, id), eq(complaints.societyId, req.societyId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Complaint not found or access denied" });
    }

    return res.status(200).json({
      message: "Complaint status updated successfully",
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 💬 Add Response / Comment to Complaint
 */
export async function addComplaintComment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!id || !text || !text.trim()) {
      return res.status(400).json({ error: "Complaint ID and comment text are required" });
    }

    const [existing] = await db
      .select({ comments: complaints.comments })
      .from(complaints)
      .where(and(eq(complaints.id, id), eq(complaints.societyId, req.societyId)))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const currentComments = existing.comments || [];
    const newCommentObj = {
      id: `cm_${Date.now()}`,
      author: req.user.name || "User",
      role: req.user.role || "resident",
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const [updated] = await db
      .update(complaints)
      .set({
        comments: [...currentComments, newCommentObj],
        updatedAt: new Date(),
      })
      .where(and(eq(complaints.id, id), eq(complaints.societyId, req.societyId)))
      .returning();

    return res.status(200).json({
      message: "Comment added successfully",
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
}
