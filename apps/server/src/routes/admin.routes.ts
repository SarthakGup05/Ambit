import { Router } from "express";
import { authenticate, requireSociety, requireAdmin } from "../middleware/tenant.middleware.js";
import {
  getAnalytics,
  getMembers,
  getGuards,
  getVisitors,
  getSociety,
  createMember,
  updateMember,
  deleteMember,
} from "../controllers/admin.controller.js";
import {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} from "../controllers/admin-amenities.controller.js";

const router = Router();

// Apply admin access check middleware to all routes in this router
router.use(authenticate, requireSociety, requireAdmin);

/**
 * 📊 Get analytics stats
 */
router.get("/analytics", getAnalytics);

/**
 * 🏢 Get society configurations
 */
router.get("/society", getSociety);

/**
 * 👥 Get resident directory members
 */
router.get("/members", getMembers);
router.post("/members", createMember);
router.put("/members/:id", updateMember);
router.delete("/members/:id", deleteMember);

/**
 * 🏢 Get society guards list
 */
router.get("/guards", getGuards);

/**
 * 📋 Get all visitor entry logs
 */
router.get("/visitors", getVisitors);

/**
 * 🏢 Manage society amenities (facilities)
 */
router.get("/amenities", getAmenities);
router.post("/amenities", createAmenity);
router.put("/amenities/:id", updateAmenity);
router.delete("/amenities/:id", deleteAmenity);

export default router;

