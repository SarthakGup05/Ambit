import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { visitors, user } from "../models/schema.js";

/**
 * 🏢 Get resident directory (flats & names) for Guard lookup and visitor registration
 */
export async function getResidentDirectory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        flatNumber: user.flatNumber,
      })
      .from(user)
      .where(
        and(
          eq(user.societyId, req.societyId),
          eq(user.role, "resident")
        )
      )
      .orderBy(user.flatNumber);

    return res.status(200).json({ directory: members });
  } catch (error) {
    next(error);
  }
}

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
 * 🛡️ Get all visitors across society (Guard & Admin view with overview stats)
 */
export async function getSocietyVisitors(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { status } = req.query;

    const list = await db
      .select()
      .from(visitors)
      .where(eq(visitors.societyId, req.societyId))
      .orderBy(desc(visitors.createdAt));

    // Filter list if status provided
    let filtered = list;
    if (status && typeof status === "string" && status !== "all") {
      filtered = list.filter((v) => v.status === status);
    }

    // Compute overview stats for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVisitors = list.filter((v) => new Date(v.createdAt) >= startOfToday);
    const stats = {
      total: todayVisitors.length,
      entered: todayVisitors.filter((v) => v.status === "checked_in" || v.status === "approved").length,
      exited: todayVisitors.filter((v) => v.status === "checked_out").length,
      pending: todayVisitors.filter((v) => v.status === "pending").length,
    };

    return res.status(200).json({
      visitors: filtered,
      stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🚪 Register new visitor at the gate (Guard feature)
 */
export async function createGateVisitor(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { flatNumber, name, phone, purpose, autoCheckIn = true } = req.body;

    if (!flatNumber || !name || !purpose) {
      return res.status(400).json({ error: "Flat number, visitor name, and purpose are required" });
    }

    const status = autoCheckIn ? "checked_in" : "pending";
    const checkInTime = autoCheckIn ? new Date() : null;

    const [newVisitor] = await db
      .insert(visitors)
      .values({
        societyId: req.societyId,
        flatNumber: flatNumber.trim(),
        name: name.trim(),
        phone: phone ? phone.trim() : "N/A",
        purpose: purpose.trim(),
        status,
        checkInTime,
        approvedBy: req.user?.id || null,
      })
      .returning();

    return res.status(201).json({
      message: "Visitor registered successfully",
      visitor: newVisitor,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🚪 Perform Gate Check-Out for a visitor
 */
export async function checkoutVisitor(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Visitor ID is required" });
    }

    const [updated] = await db
      .update(visitors)
      .set({
        status: "checked_out",
        checkOutTime: new Date(),
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
      return res.status(404).json({ error: "Visitor record not found" });
    }

    return res.status(200).json({
      message: "Visitor checked out successfully",
      visitor: updated,
    });
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

    const validStatuses = ["approved", "denied", "checked_in", "checked_out"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData: Record<string, any> = {
      status,
      approvedBy: req.user.id,
      updatedAt: new Date(),
    };

    if (status === "checked_in" || status === "approved") {
      updateData.checkInTime = new Date();
    } else if (status === "checked_out") {
      updateData.checkOutTime = new Date();
    }

    const [updated] = await db
      .update(visitors)
      .set(updateData)
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
