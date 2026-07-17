import { type Request, type Response, type NextFunction } from "express";
import { eq, and, count, gte, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { user, visitors, societies } from "../models/schema.js";
import { auth } from "../auth.js";

/**
 * 📊 Get Dashboard Analytics
 * Retrieves statistics for the society admin dashboard.
 */
export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    // 1. Total Residents
    const [residentsResult] = await db
      .select({ value: count() })
      .from(user)
      .where(
        and(
          eq(user.societyId, req.societyId),
          eq(user.role, "resident")
        )
      );

    // 2. Active Visitors (Currently Checked In)
    const [activeVisitorsResult] = await db
      .select({ value: count() })
      .from(visitors)
      .where(
        and(
          eq(visitors.societyId, req.societyId),
          eq(visitors.status, "checked_in")
        )
      );

    // 3. Today's Visitor Requests (Approved + Denied + Pending)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayVisitorsResult] = await db
      .select({ value: count() })
      .from(visitors)
      .where(
        and(
          eq(visitors.societyId, req.societyId),
          gte(visitors.createdAt, startOfToday)
        )
      );

    return res.status(200).json({
      analytics: {
        totalResidents: residentsResult?.value || 0,
        activeVisitors: activeVisitorsResult?.value || 0,
        todayEntries: todayVisitorsResult?.value || 0,
        planStatus: "Starter Free", // Default plan state for demo
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 👥 Get Residents List (Directory)
 */
export async function getMembers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const list = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        flatNumber: user.flatNumber,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(
        and(
          eq(user.societyId, req.societyId),
          eq(user.role, "resident")
        )
      )
      .orderBy(desc(user.createdAt));

    return res.status(200).json({ members: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 🛡️ Get Guards List
 */
export async function getGuards(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const list = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        flatNumber: user.flatNumber,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(
        and(
          eq(user.societyId, req.societyId),
          eq(user.role, "guard")
        )
      )
      .orderBy(desc(user.createdAt));

    return res.status(200).json({ guards: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 📋 Get All Visitor History
 */
export async function getVisitors(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const list = await db
      .select()
      .from(visitors)
      .where(eq(visitors.societyId, req.societyId))
      .orderBy(desc(visitors.createdAt));

    return res.status(200).json({ visitors: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 🏢 Get Society Info
 */
export async function getSociety(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    const [society] = await db
      .select()
      .from(societies)
      .where(eq(societies.id, req.societyId))
      .limit(1);

    if (!society) {
      return res.status(404).json({ error: "Society not found" });
    }

    return res.status(200).json({ society });
  } catch (error) {
    next(error);
  }
}

/**
 * 👥 Create New Resident Member
 */
export async function createMember(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role !== "admin" || !req.societyId) {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const { name, email, password, flatNumber } = req.body;

    if (!name || !email || !password || !flatNumber) {
      return res.status(400).json({ error: "Name, email, password, and flat number are required" });
    }

    const headers = new Headers();
    if (typeof req.headers.authorization === "string") {
      headers.set("authorization", req.headers.authorization);
    }
    if (typeof req.headers.cookie === "string") {
      headers.set("cookie", req.headers.cookie);
    }

    // 1. Create user via Better-Auth
    const newResidentUser = await auth.api.createUser({
      headers,
      body: {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      },
    });

    // 2. Set role, society association, and flat number
    const [updatedUser] = await db
      .update(user)
      .set({
        role: "resident",
        societyId: req.societyId,
        flatNumber: flatNumber.trim(),
      })
      .where(eq(user.id, newResidentUser.user.id))
      .returning();

    return res.status(201).json({
      message: "Resident member created successfully",
      member: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 👥 Update Resident Member Details
 */
export async function updateMember(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role !== "admin" || !req.societyId) {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Resident ID is required" });
    }

    const { name, email, flatNumber } = req.body;
    if (!name || !email || !flatNumber) {
      return res.status(400).json({ error: "Name, email, and flat number are required" });
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        flatNumber: flatNumber.trim(),
      })
      .where(
        and(
          eq(user.id, id),
          eq(user.societyId, req.societyId),
          eq(user.role, "resident")
        )
      )
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: "Resident member not found or access denied" });
    }

    return res.status(200).json({
      message: "Resident member updated successfully",
      member: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 👥 Delete Resident Member
 */
export async function deleteMember(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.role !== "admin" || !req.societyId) {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Resident ID is required" });
    }

    const [deletedUser] = await db
      .delete(user)
      .where(
        and(
          eq(user.id, id),
          eq(user.societyId, req.societyId),
          eq(user.role, "resident")
        )
      )
      .returning();

    if (!deletedUser) {
      return res.status(404).json({ error: "Resident member not found or access denied" });
    }

    return res.status(200).json({
      message: "Resident member deleted successfully",
      member: deletedUser,
    });
  } catch (error) {
    next(error);
  }
}

