import "dotenv/config";
import express from "express";
import { auth } from "./auth.js";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.all("/api/auth/*splat", toNodeHandler(auth));

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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "reporting-auth" });
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
