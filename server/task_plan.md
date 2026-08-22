# Task Plan — Auth Backend (`/server`) + Next Milestones

**Goal (achieved):** Auth service Express 5 + better-auth + PostgreSQL di `server/` — register/login/session/protected endpoint berfungsi, CORS lintas-origin siap (dipanggil dari http://localhost:5173).

## COMPLETED (archive, v1)
- P1 Scaffold — package.json (Express 5.2.1, better-auth 1.7.1, drizzle-orm 0.45.2, pg, tsx, tsc) + tsconfig NodeNext + .env(.example) + DB `db_reporting` created (`postgres://postgres:password@localhost:5432/db_reporting`) + GET /api/health 200
- P2 DB layer — schema via `npx auth@latest generate` (canonical v1.7: `account.issuer NOT NULL`, FK indexes, unique email/token); migration 0000+0001 applied; 4 tables
- P3 Auth service — `src/auth.ts` betterAuth (emailAndPassword + trustedOrigins env) + `toNodeHandler` mount `/api/auth/*splat`
- P4 Guard — `GET /api/me` (auth.api.getSession), 401/200 verified
- P5 Cross-origin — `cors` middleware (origin=BETTER_AUTH_TRUSTED_ORIGINS, credentials) + docs/AGENTS + commits lokal a0af383/0e5a1bc/269f9c7 (belum dipush)

## Current Phase Summary
- **Status:** M1 COMPLETE (semua 4 sub-phase) — worktree bersih, commit lokal berikut
- Next milestones kandidat: **M1** integrasi login dashboard (rekomendasi), M2 email verification + reset-password (SMTP), M3 login sosial, M4 README endpoint + skrip dev

## Milestone M1 — Dashboard Auth Integration (kandidat utama)
**Goal:** Dashboard (Vite :5173) bisa register/login, header menampilkan user, halaman sensitif bisa cek sesi — tanpa mengganggu fitur existing.

### M1.1: Client auth helper di dashboard (complete)
**Status:** complete
- [x] better-auth `createAuthClient` (baseURL VITE_AUTH_URL ?? http://localhost:4000) — cross-origin langsung, tanpa proxy
- [x] `src/lib/auth-client.ts` — lazy dynamic import (client TIDAK masuk index bundle)
- [x] `npm run build` dashboard lolos

### M1.2: UI login/register (complete)
**Status:** complete
- [x] Rute `/login` di luar Layout + halaman Login (email/password + toggle Daftar)
- [x] Tanpa gating halaman (default): halaman laporan tetap terbuka, header session-aware (UserMenu: nama+email+Keluar; guest: Masuk)
- [x] UserMenu refresh sesi setiap dropdown dibuka (cookie register bisa telat)
- [x] FIX GOTCHA: client better-auth tidak throw — resolve {data,error}; cek res.error sebelum navigate

### M1.3: Guard opsional (complete — default NO gating)
**Status:** complete
- [x] /login + tombol Masuk → profil + logout; halaman laporan tetap terbuka
- [x] ProtectedRoute tetap opsional (belum diaktifkan)

### M1.4: Verify + docs (complete)
**Status:** complete
- [x] Playwright 6/6 PASS: guest, daftar, header logged, logout, login ulang, no errors
- [x] AGENTS.md section Dashboard Auth Integration (baseURL env, dynamic import, res.error gotcha, kedua server harus jalan)

## Next Step
Commit lokal M1 (tanpa push). Kandidat berikutnya: M2 email verification/reset-password, atau update profile pengguna di dashboard (Pengaturan).

## Decisions Made
| Date | Decision | Note |
|------|----------|------|
| 2026-08-23 | Express 5 + better-auth + drizzle/pg | User; skill terinstal |
| 2026-08-23 | better-auth 1.7: `better-auth/node` toNodeHandler *(bukan `*/express`)*, Express 5 `*splat` | Hard-earned, di AGENTS.md |
| 2026-08-23 | CORS manual (better-auth tidak menyediakan) | trustedOrigins = CSRF only |
| 2026-08-23 | Tidak push ke main sampai integrasi dirasa siap | Perintah user "implement only" |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| @better-auth/cli generate (v1.4 deprecated) → `account.issuer` missing | 1 | `npx auth@latest generate` (samakan runtime 1.7.1) |
| Express 5 wildcard `*` → PathError | 1 | `*splat` |
| `better-auth/express` subpath tidak diexport | 1 | `better-auth/node` |
| tsx process exit 0 hening (index.ts rewrite drop listen blocks) | 2 | tulis ulang file utuh; `npm run build` sebagai gate |
| `pkill -f tsx` membunuh shell sendiri | 2 | `fuser -k 4000/tcp` |
