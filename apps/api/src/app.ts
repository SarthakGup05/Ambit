import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { auth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";
import onboardingRouter from "./routes/onboarding.routes.js";
import adminRouter from "./routes/admin.routes.js";
import noticesRouter from "./routes/notices.routes.js";
import pollsRouter from "./routes/polls.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Better-Auth handler
app.all("/api/auth/*", (req, res) => {
  return toNodeHandler(auth)(req, res);
});

// Onboarding Routes
app.use("/api/onboarding", onboardingRouter);

// Admin Routes
app.use("/api/admin", adminRouter);

// Notices Routes
app.use("/api/notices", noticesRouter);

// Polls Routes
app.use("/api/polls", pollsRouter);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

export default app;
