import { type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { amenities, bookings } from "../models/schema.js";

/**
 * 🏢 Fetch all society amenities for the admin's society
 */
export async function getAmenities(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }
    const societyId = req.societyId;

    const list = await db
      .select()
      .from(amenities)
      .where(eq(amenities.societyId, societyId));

    return res.status(200).json({ amenities: list });
  } catch (error) {
    next(error);
  }
}

/**
 * ✍️ Create a new society amenity
 */
export async function createAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }
    const societyId = req.societyId;
    const { name, description, capacity, status, operatingHours, imageUrl } = req.body;

    if (!name || !description || capacity === undefined) {
      return res.status(400).json({ error: "Name, description, and capacity are required" });
    }

    const [newAmenity] = await db
      .insert(amenities)
      .values({
        societyId,
        name,
        description,
        capacity,
        status: status || "active",
        operatingHours: operatingHours || null,
        imageUrl: imageUrl || null,
      })
      .returning();

    return res.status(201).json({ amenity: newAmenity });
  } catch (error) {
    next(error);
  }
}

/**
 * 🔄 Update an existing society amenity
 */
export async function updateAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }
    const societyId = req.societyId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Amenity ID is required" });
    }

    const { name, description, capacity, status, operatingHours, imageUrl } = req.body;

    const [updated] = await db
      .update(amenities)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity }),
        ...(status !== undefined && { status }),
        ...(operatingHours !== undefined && { operatingHours }),
        ...(imageUrl !== undefined && { imageUrl }),
      })
      .where(and(eq(amenities.id, id), eq(amenities.societyId, societyId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Amenity not found or access denied" });
    }

    return res.status(200).json({ amenity: updated });
  } catch (error) {
    next(error);
  }
}

/**
 * 🗑️ Safely delete an amenity and all its bookings
 */
export async function deleteAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.societyId) {
      return res.status(400).json({ error: "Society association required" });
    }
    const societyId = req.societyId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Amenity ID is required" });
    }

    // 1. Delete bookings referencing this amenity to satisfy FK constraints
    await db
      .delete(bookings)
      .where(and(eq(bookings.amenityId, id), eq(bookings.societyId, societyId)));

    // 2. Delete the amenity itself
    const [deleted] = await db
      .delete(amenities)
      .where(and(eq(amenities.id, id), eq(amenities.societyId, societyId)))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Amenity not found or access denied" });
    }

    return res.status(200).json({ message: "Amenity deleted successfully", id });
  } catch (error) {
    next(error);
  }
}
