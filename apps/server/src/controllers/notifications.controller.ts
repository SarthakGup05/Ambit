import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../models/schema.js";

/**
 * 🔔 Fetch notifications for current user (Auto-seeds demo alerts if empty)
 */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let list = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.societyId, req.societyId),
          eq(notifications.userId, req.user.id)
        )
      )
      .orderBy(desc(notifications.createdAt));

    // Seed default notifications for demo if list is empty
    if (list.length === 0) {
      const now = new Date();
      const today = (hours: number, minutes: number) => {
        const d = new Date(now);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };
      const yesterday = (hours: number, minutes: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - 1);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const defaults = [
        {
          title: "Visitor Approval Request",
          body: "Amazon Delivery partner is waiting for your approval at Gate.",
          isRead: false,
          createdAt: today(10, 32),
        },
        {
          title: "Pre-Approved Guest Arriving",
          body: "Rahul Sharma is expected to arrive today between 6:00 PM - 8:00 PM.",
          isRead: false,
          createdAt: today(9, 15),
        },
        {
          title: "Complaint Updated",
          body: "Your complaint #CM-1023 has been assigned to the maintenance team.",
          isRead: false,
          createdAt: today(8, 45),
        },
        {
          title: "New Society Notice",
          body: "Water supply will be interrupted on 18 May 2025 from 10:00 AM to 2:00 PM.",
          isRead: false,
          createdAt: today(8, 30),
        },
        {
          title: "Amenity Booking Confirmed",
          body: "Your booking for Club House on 18 May 2025 at 6:00 PM is confirmed.",
          isRead: true,
          createdAt: yesterday(18, 0),
        },
        {
          title: "Poll Results Available",
          body: "See results for the poll \"Parking Management Improvement\".",
          isRead: true,
          createdAt: yesterday(16, 0),
        },
        {
          title: "Entry Log",
          body: "Rahul Sharma (Guest) has exited the society at 07:45 PM.",
          isRead: true,
          createdAt: yesterday(14, 0),
        },
      ];

      await db.insert(notifications).values(
        defaults.map((d) => ({
          societyId: req.societyId!,
          userId: req.user!.id,
          title: d.title,
          body: d.body,
          isRead: d.isRead,
          createdAt: d.createdAt,
        }))
      );

      list = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.societyId, req.societyId),
            eq(notifications.userId, req.user.id)
          )
        )
        .orderBy(desc(notifications.createdAt));
    }

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
