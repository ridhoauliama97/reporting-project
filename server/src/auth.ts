import "dotenv/config";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/pool.js";
import { schema } from "./db/schema.js";
import { sendMail } from "./mailer.js";

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const redirectURL = process.env.BETTER_AUTH_REDIRECT_URL ?? "http://localhost:5173";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, token }) => {
      const url = `${redirectURL}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: "Atur Ulang Password — Database Report",
        text: `Halo ${user.name},\n\nAnda dapat mengatur ulang password melalui tautan berikut:\n${url}\n\nTautan ini berlaku sementara dan hanya untuk akun Anda.\nAbaikan email ini jika permintaan bukan dari Anda.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${process.env.BETTER_AUTH_URL ?? redirectURL}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(redirectURL)}`;
      await sendMail({
        to: user.email,
        subject: "Verifikasi Email — Database Report",
        text: `Halo ${user.name},\n\nVerifikasi email Anda melalui tautan berikut:\n${url}\n\nTautan ini berlaku sementara.`,
      });
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: trustedOrigins.length ? trustedOrigins : [process.env.BETTER_AUTH_URL ?? ""].filter(Boolean),
});
