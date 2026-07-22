import { type Request, type Response, type NextFunction } from "express";
import { eq, and, desc, or, lte, gte } from "drizzle-orm";
import { db } from "../db/index.js";
import { amenities, bookings, user } from "../models/schema.js";

/**
 * 🏢 Get all amenities (Auto-seeds default list if empty)
 */
export async function getAmenities(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }

    let list = await db
      .select()
      .from(amenities)
      .where(eq(amenities.societyId, req.societyId));

    // Auto-seed default amenities for society if empty
    if (list.length === 0) {
      const defaults = [
        { name: "Clubhouse Lounge", description: "Premium space for community gatherings and private events.", capacity: 50 },
        { name: "Swimming Pool", description: "Olympic size swimming pool with temperature controls.", capacity: 20 },
        { name: "Tennis Court", description: "Double-court setup with evening floodlights.", capacity: 4 },
        { name: "Fitness Center / Gym", description: "Modern workout equipment, free weights, and cardio decks.", capacity: 15 },
      ];

      await db.insert(amenities).values(
        defaults.map((d) => ({
          societyId: req.societyId!,
          ...d,
        }))
      );

      list = await db
        .select()
        .from(amenities)
        .where(eq(amenities.societyId, req.societyId));
    }

    return res.status(200).json({ amenities: list });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗓️ Get bookings
 */
export async function getBookings(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admins see all society bookings, residents see their own bookings
    const condition =
      req.user.role === "admin"
        ? eq(bookings.societyId, req.societyId)
        : and(eq(bookings.societyId, req.societyId), eq(bookings.residentId, req.user.id));

    const list = await db
      .select({
        id: bookings.id,
        startTime: bookings.startTime,
        endTime: bookings.endTime,
        status: bookings.status,
        createdAt: bookings.createdAt,
        amenityId: bookings.amenityId,
        amenityName: amenities.name,
        residentName: user.name,
        flatNumber: user.flatNumber,
      })
      .from(bookings)
      .innerJoin(amenities, eq(bookings.amenityId, amenities.id))
      .innerJoin(user, eq(bookings.residentId, user.id))
      .where(condition)
      .orderBy(desc(bookings.startTime));

    return res.status(200).json({ bookings: list });
  } catch (error) {
    next(error);
  }
}

/**
 * ✍️ Create a booking (with timeslot overlap check)
 */
export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { amenityId, startTime, endTime } = req.body;

    if (!amenityId || !startTime || !endTime) {
      return res.status(400).json({ error: "Amenity ID, start time, and end time are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // 1. Check for overlapping bookings on the same amenity that are confirmed/pending
    const overlaps = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.amenityId, amenityId),
          eq(bookings.societyId, req.societyId),
          or(eq(bookings.status, "confirmed"), eq(bookings.status, "pending")),
          or(
            // New booking starts during an existing booking
            and(gte(bookings.startTime, start), lte(bookings.startTime, end)),
            // New booking ends during an existing booking
            and(gte(bookings.endTime, start), lte(bookings.endTime, end))
          )
        )
      );

    if (overlaps.length > 0) {
      return res.status(409).json({ error: "Timeslot is already booked by another resident" });
    }

    // 2. Insert booking
    const [newBooking] = await db
      .insert(bookings)
      .values({
        societyId: req.societyId,
        amenityId,
        residentId: req.user.id,
        startTime: start,
        endTime: end,
        status: "confirmed", // Auto-confirm in demo mode
      })
      .returning();

    // Fetch details to return name
    const [amenityDetails] = await db
      .select({ name: amenities.name })
      .from(amenities)
      .where(eq(amenities.id, amenityId))
      .limit(1);

    return res.status(201).json({
      message: "Amenity booked successfully",
      booking: {
        ...newBooking,
        amenityName: amenityDetails?.name || "Amenity",
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔄 Update booking status (confirm/cancel)
 */
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.societyId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const societyId = req.societyId;

    if (!status || !["confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    // Residents can only cancel their own bookings, admins can change any booking
    const condition =
      req.user.role === "admin"
        ? and(eq(bookings.id, id), eq(bookings.societyId, societyId))
        : and(
            eq(bookings.id, id),
            eq(bookings.societyId, societyId),
            eq(bookings.residentId, req.user.id)
          );

    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(condition)
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }

    return res.status(200).json({ booking: updated });
  } catch (error) {
    next(error);
  }
}
