# Progress — Auth Backend (`/server`)

## 2026-08-23 — Session 1 (planning + scaffold)
- Skill planning-with-files dimuat; planning files dibuat di `server/`
- Environment diverifikasi: Node 24.18.0, Postgres accepting connections @5432 (no docker), /server kosong
- Keputusan user: Express 5 + better-auth (via sesi tanya); ORM drizzle-orm + pg
- **Phase 1 started**: beli package.json/tsconfig/.env, buat DB db_reporting

### Next action
- Buat `server/package.json`, `tsconfig.json`, `.env`, `.env.example`
- `npm install` di server/
- Buat DB: `psql -U postgres -h localhost -c "CREATE DATABASE db_reporting;"` (password=password)
- Skeleton `src/index.ts` + `GET /api/health` + verifikasi `npm run dev`

## 2026-08-23 — Session 1b (server build, phases 1-4 done)
- Phase 1: scaffold + DB `db_reporting` created, health 200
- Phase 2: schema generated via `npx auth@latest generate` (ACCOUNT ISSUER gotcha, v1.4 CLI rejected), migration 0000+0001 applied, 4 tables w/ indexes
- Phase 3: betterAuth + `toNodeHandler` from `better-auth/node` (v1.7 no `better-auth/express`), Express 5 needs `/api/auth/*splat`; curl sign-up/sign-in/get-session all 200, cookie HttpOnly saved
- Phase 4: GET /api/me — 401 без cookie, 200 with cookie
- Phase 5 (in progress): tsc build OK, AGENTS.md updated. NOT committed; cleaning test users optional
- ERRORS LOGGED: issuer-missing (fixed by new CLI), path-to-regexp wildcard (fixed by *splat), pkill matching own shell (use fuser -k 4000/tcp)

## 2026-08-23 — Session 1c (auth complete, cross-origin)
- CORS: trustedOrigins hanya CSRF di v1.7 → `cors` middleware ditambahkan; preflight 204 + ACAO verified
- smoke penuh (Origin 5173): sign-in → update-user → change-password → re-login → /api/me semua 200
- .env(.example) + auth.ts trustedOrigins + minPasswordLength 8; DB test users truncated
- Commit lokal: 0e5a1bc (feat: cross-origin auth) — TIDAK di-push

## 2026-08-23 — Session 2: planning ulang (restructure)
- Konteks dipulihkan; rencana lama diarsipkan sebagai COMPLETED
- Kandidat milestone: M1 integrasi dashboard (rekomendasi), M2 email/reset-password, M3 social login, M4 README
- Menunggu keputusan user M1-M4; Next Step: update plan sesuai pilihan
