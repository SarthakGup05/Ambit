import { type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { societies, user } from "../models/schema.js";
import { auth } from "../auth.js";

// Helper to generate a unique 6-character society invite code
async function generateUniqueInviteCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let attempts = 0;
  
  while (attempts < 100) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code is already used
    const existing = await db
      .select({ id: societies.id })
      .from(societies)
      .where(eq(societies.inviteCode, code))
      .limit(1);
      
    if (existing.length === 0) {
      return code;
    }
    attempts++;
  }
  throw new Error("Failed to generate a unique invite code after many attempts");
}

/**
 * 🏢 Admin Onboarding
 * Registers a new society and sets the authenticated user as the admin.
 */
export async function adminOnboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Society name and address are required" });
    }

    if (req.user?.societyId) {
      return res.status(400).json({ error: "User is already associated with a society" });
    }

    const inviteCode = await generateUniqueInviteCode();

    // Start database transaction
    const result = await db.transaction(async (tx) => {
      // 1. Create the new society
      const [newSociety] = await tx
        .insert(societies)
        .values({
          name: name.trim(),
          address: address.trim(),
          inviteCode,
        })
        .returning();

      if (!newSociety) {
        throw new Error("Failed to create society");
      }

      // 2. Set the authenticated user as admin of this society
      const [updatedUser] = await tx
        .update(user)
        .set({
          societyId: newSociety.id,
          role: "admin",
        })
        .where(eq(user.id, req.user!.id))
        .returning();

      return { society: newSociety, user: updatedUser };
    });

    return res.status(201).json({
      message: "Admin onboarding completed successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 👥 Resident Onboarding
 * Associates the authenticated user with a society using an invite code.
 */
export async function residentOnboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { inviteCode, flatNumber } = req.body;

    if (!inviteCode || !flatNumber) {
      return res.status(400).json({ error: "Invite code and flat number are required" });
    }

    if (req.user?.societyId) {
      return res.status(400).json({ error: "User is already associated with a society" });
    }

    // Find the target society
    const [targetSociety] = await db
      .select()
      .from(societies)
      .where(eq(societies.inviteCode, inviteCode.trim().toUpperCase()))
      .limit(1);

    if (!targetSociety) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    // Associate user with the society as a resident
    const [updatedUser] = await db
      .update(user)
      .set({
        societyId: targetSociety.id,
        flatNumber: flatNumber.trim(),
        role: "resident",
      })
      .where(eq(user.id, req.user!.id))
      .returning();

    return res.status(200).json({
      message: "Resident onboarding completed successfully",
      society: targetSociety,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 🛡️ Guard Onboarding (Admin Only)
 * Creates a new guard account programmatically and associates it with the admin's society.
 */
export async function guardOnboard(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Verify caller is an admin
    if (req.user?.role !== "admin" || !req.societyId) {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required for guard" });
    }

    const headers = new Headers();
    if (typeof req.headers.authorization === "string") {
      headers.set("authorization", req.headers.authorization);
    }
    if (typeof req.headers.cookie === "string") {
      headers.set("cookie", req.headers.cookie);
    }

    // 1. Create the user via Better-Auth to handle credentials hashing and account link
    const newGuardUser = await auth.api.createUser({
      headers,
      body: {
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      },
    });

    // 2. Assign role 'guard' and set societyId using Drizzle
    const [updatedGuardUser] = await db
      .update(user)
      .set({
        role: "guard",
        societyId: req.societyId,
      })
      .where(eq(user.id, newGuardUser.user.id))
      .returning();

    return res.status(201).json({
      message: "Guard account created successfully by admin",
      user: updatedGuardUser,
    });
  } catch (error) {
    // If it's a Better-Auth programmatic error, it might be nested
    next(error);
  }
}
