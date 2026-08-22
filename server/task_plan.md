# Task Plan — Auth Backend (`/server`)

**Goal:** Auth service berbasis Express 5 + better-auth + PostgreSQL di `server/` — register/login/session berfungsi, terhubung ke `postgres://postgres:password@localhost:5432/db_reporting`.

## Stack (decided)
- Express 5, better-auth (email/password + session), drizzle-orm + pg, TypeScript, tsx (dev), tsc (build)
- Runtime: Node v24.18.0; PostgreSQL sudah running di localhost:5432 (psql tersedia, tanpa docker)

## Current Phase Summary
- **Status:** Phase 5 in_progress
- **Phases:** 5 total, 4 complete

## Phases
### Phase 1: Scaffold (complete)
**Status:** complete
- [x] server/package.json: express@5, better-auth, drizzle-orm, pg, dotenv, typescript, tsx, @types/express@5, @types/node, @types/pg, drizzle-kit
- [x] tsconfig.json (NodeNext, strict, outDir dist)
- [x] .env + .env.example (DATABASE_URL) — .env* sudah di-gitignore root
- [x] src/index.ts skeleton (Express + GET /api/health)
- [x] Buat database `db_reporting` (psql, user postgres/password=password)
- [x] Verifikasi: `npm run dev` jalan, /api/health 200

### Phase 2: Database layer (complete)
**Status:** complete
- [x] Load skill supabase-postgres-best-practices SEBELUM menulis schema
- [x] drizzle.config.ts (driver postgres, source src/db/schema.ts, out drizzle/)
- [x] src/db/schema.ts — tabel auth better-auth: user, session, account, verification (PARAMETER: pakai output kanonik `@better-auth/cli generate` — bukan tulisan tangan; index FK + unique token/email sudah ter-generate)
- [x] `drizzle-kit generate` (drizzle/0000_regular_namor.sql) + `drizzle-kit migrate` → tabel terbuat
- [x] Verifikasi: `\dt` di psql menampilkan 4 tabel + index FK

### Phase 3: Auth service (complete)
**Status:** complete
- [x] src/auth.ts — betterAuth({ emailAndPassword: { enabled: true }, database: drizzleAdapter(...) })
- [x] Mount auth handler di `/api/auth/*splat` (v1.7: `toNodeHandler` dari `better-auth/node` — `better-auth/express` TIDAK ADA)
- [x] Verifikasi: curl sign-up → token+user, sign-in → cookie HttpOnly, get-session → session (semua 200)
### Phase 4: Session guard + endpoint sample (complete)
**Status:** complete
- [x] GET /api/me via auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
- [x] Contoh protected endpoint GET /api/me ditolak tanpa session
- [x] Verifikasi curl: tanpa cookie 401, dengan cookie 200

### Phase 5: Perapian + docs (in_progress)
**Status:** in_progress
- [x] `npm run build` (tsc) lolos; dist/ sudah di-gitignore root
- [x] Update AGENTS.md bagian Backend: deskripsi aktual (stack, endpoint, gotchas schema/mount)
- [ ] README server singkat (opsional, sesuai keinginan owner)

## Next Step
Phase 5: commit server/ + drizzle/ migrations (belum — tunggu konfirmasi user), README server opsional.

## Decisions Made
| Date | Decision | Note |
|------|----------|------|
| 2026-08-23 | Framework: Express 5 (bukan Fastify/Hono) | Permintaan user "gunakan express saja" |
| 2026-08-23 | Auth: better-auth (bukan hand-rolled JWT / express-session) | Pilihan user via sesi planning; skill terinstal |
| 2026-08-23 | ORM: drizzle-orm + pg adapter (bukan Prisma) | better-auth butuh adapter DB; drizzle + drizzle-kit lighter, schema file di-repo, skill Prisma tidak dipakai |
| 2026-08-23 | Planning files di `server/` | Work terkonsentrasi di folder server |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| @better-auth/cli generate: "Couldn't read your auth config in ./drizzle.config.ts" | 1 | CLI generate harus diberi config AUTH instance (`--config ./src/auth.ts`), bukan drizzle.config.ts — pindah ke src/auth.ts yang berisi betterAuth() |
| @better-auth/cli generate meminta interaktif "Do you want to generate schema...?" | 2 | Tambah `--output` + `-y` untuk mode non-interaktif |
