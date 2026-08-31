import "dotenv/config";
import { generateId } from "@better-auth/core/utils/id";
import { hashPassword } from "better-auth/crypto";
import { pool, db } from "../src/db/pool.js";
import { user, account } from "../src/db/schema.js";
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? "Admin1234!";

type SeedUser = {
  name: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
};

function loadUsers(): SeedUser[] {
  if (process.env.SEED_USERS) {
    try {
      return JSON.parse(process.env.SEED_USERS) as SeedUser[];
    } catch (err) {
      throw new Error(
        `SEED_USERS bukan JSON valid: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return [
    { name: "Admin Utama", email: "admin@report.local", password: "Admin1234!" },
    { name: "Supervisor Gudang", email: "spv@report.local", password: "Gudang123!" },
  ];
}

async function main() {
  const users = loadUsers();
  console.log(`Seeding ${users.length} user(s)...`);

  const emails = users.map((u) => u.email.toLowerCase());
  const existing = await db.query.user.findMany({
    where: (u, { inArray }) => inArray(u.email, emails),
  });
  const existingEmails = new Set(existing.map((u) => u.email.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const u of users) {
    const email = u.email.toLowerCase();
    if (existingEmails.has(email)) {
      console.log(`SKIP: ${email} (sudah ada)`);
      skipped += 1;
      continue;
    }

    const password = u.password ?? DEFAULT_PASSWORD;
    const hashed = await hashPassword(password);
    const userId = generateId();

    await db.transaction(async (tx) => {
      await tx.insert(user).values({
        id: userId,
        name: u.name,
        email,
        emailVerified: u.emailVerified ?? true,
      });
      await tx.insert(account).values({
        id: generateId(),
        userId,
        accountId: userId,
        providerId: "credential",
        issuer: "local:credential",
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    console.log(`CREATE: ${email} (${u.name})`);
    created += 1;
  }

  console.log(`\nSelesai: ${created} dibuat, ${skipped} dilewati, ${users.length - created - skipped} gagal`);
  if (created + skipped !== users.length) process.exitCode = 1;
  await pool.end();
}

main();
