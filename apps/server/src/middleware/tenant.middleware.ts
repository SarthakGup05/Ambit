import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request type to include user, session, and societyId
declare global {
  namespace Express {
    interface Request {
      user?: typeof auth.$Infer.Session.user;
      session?: typeof auth.$Infer.Session.session;
      societyId?: string;
    }
  }
}

/**
 * Authenticates the request using Better-Auth sessions.
 * Attaches the user and session to the request object.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized: No valid session found" });
    }

    req.user = session.user;
    req.session = session.session;
    
    if (session.user.societyId) {
      req.societyId = session.user.societyId;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Enforces that the authenticated user is bound to a society.
 * Must be used after the 'authenticate' middleware.
 */
export function requireSociety(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required" });
  }

  if (!req.societyId) {
    return res.status(403).json({ 
      error: "Forbidden: You must create or join a society to perform this action" 
    });
  }

  next();
}

/**
 * Enforces that the authenticated user has the 'admin' role.
 * Must be used after the 'authenticate' middleware.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin privileges required" });
  }

  next();
}

