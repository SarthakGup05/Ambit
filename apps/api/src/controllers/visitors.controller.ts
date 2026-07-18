import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { visitors } from "../models/schema.js";

/**
 * 👥 Get visitors for resident's flat number
 */
export async function getFlatVisitors(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId || !req.user.flatNumber) {
      return res.status(400).json({ error: "Resident flat association required" });
    }

    const list = await db
      .select()
      .from(visitors)
      .where(
        and(
          eq(visitors.societyId, req.societyId),
          eq(visitors.flatNumber, req.user.flatNumber)
        )
      )
      .orderBy(desc(visitors.createdAt));

    return res.status(200).json({ visitors: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔄 Update visitor check-in status (Approve / Deny)
 */
export async function updateVisitorStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Visitor ID and status are required" });
    }

    const validStatuses = ["approved", "denied"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update visitor
    const [updated] = await db
      .update(visitors)
      .set({
        status,
        approvedBy: req.user.id,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(visitors.id, id),
          eq(visitors.societyId, req.societyId)
        )
      )
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Visitor log not found" });
    }

    return res.status(200).json({
      message: "Visitor request updated successfully",
      visitor: updated,
    });
  } catch (error) {
    next(error);
  }
}
