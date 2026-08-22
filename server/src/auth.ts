import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/pool.js";
import { schema } from "./db/schema.js";

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: trustedOrigins.length ? trustedOrigins : [process.env.BETTER_AUTH_URL ?? ""].filter(Boolean),
});
