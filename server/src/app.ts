import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./auth.js";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";

export function createApp() {
  const app = express();

  const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: trustedOrigins,
      credentials: true,
    }),
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "reporting-auth" });
  });

  app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    res.json({ user: session.user, session: session.session });
  });

  return app;
}
