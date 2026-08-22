# Task Plan — Auth Backend (`/server`) + Next Milestones

**Goal (achieved):** Auth service Express 5 + better-auth + PostgreSQL di `server/` — register/login/session/protected endpoint berfungsi, CORS lintas-origin siap (dipanggil dari http://localhost:5173).

## COMPLETED (archive, v1)
- P1 Scaffold — package.json (Express 5.2.1, better-auth 1.7.1, drizzle-orm 0.45.2, pg, tsx, tsc) + tsconfig NodeNext + .env(.example) + DB `db_reporting` created (`postgres://postgres:password@localhost:5432/db_reporting`) + GET /api/health 200
- P2 DB layer — schema via `npx auth@latest generate` (canonical v1.7: `account.issuer NOT NULL`, FK indexes, unique email/token); migration 0000+0001 applied; 4 tables
- P3 Auth service — `src/auth.ts` betterAuth (emailAndPassword + trustedOrigins env) + `toNodeHandler` mount `/api/auth/*splat`
- P4 Guard — `GET /api/me` (auth.api.getSession), 401/200 verified
- P5 Cross-origin — `cors` middleware (origin=BETTER_AUTH_TRUSTED_ORIGINS, credentials) + docs/AGENTS + commits lokal a0af383/0e5a1bc/269f9c7 (belum dipush)

## Current Phase Summary
- **Status:** Milestone M1 (dashboard integration) — belum mulai, menunggu pilihan user
- Next milestones kandidat: **M1** integrasi login dashboard (rekomendasi), M2 email verification + reset-password (SMTP), M3 login sosial, M4 README endpoint + skrip dev

## Milestone M1 — Dashboard Auth Integration (kandidat utama)
**Goal:** Dashboard (Vite :5173) bisa register/login, header menampilkan user, halaman sensitif bisa cek sesi — tanpa mengganggu fitur existing.

### M1.1: Client auth helper di dashboard
**Status:** pending
- [ ] `npm i` better-auth client? ATAU fetch manual — keputusan: pakai `createAuthClient` dari `better-auth/react` (baseURL http://localhost:4000) + vite dev proxy `/api` → :4000 (hindari CORS di prod dev; atau tetap cross-origin + credentials:true — sudah terbukti jalan)
- [ ] Helper `src/lib/auth-client.ts` (vc login/register/signOut/useSession) di bawah `utils/`? — selaras struktur dashboard
- [ ] Cek: `npm run build` dashboard masih lolos (TS strict, noUnusedLocals)

### M1.2: UI login/register
**Status:** pending
- [ ] Rute `/login` di luar Layout (seperti `/docs`) + halaman SimpleLogin (email/password + register switch)
- [ ] Redirect `/` → `/login` saat belum login? ATAU hanya tombol login di site-header (tanpa gating halaman) — keputusan UX dengan user
- [ ] Session-aware header: kartu user di SiteHeader (nama + logout), icon sementara

### M1.3: Guard opsional
**Status:** pending
- [ ] Elemen terproteksi minimal: `/login` ada, tombol "Masuk" berubah jadi profil + logout; halaman laporan tetap terbuka (default)
- [ ] (opsional) ProtectedRoute middleware di App.tsx — hanya bila user mau gating penuh

### M1.4: Verify + docs
**Status:** pending
- [ ] Playwright: login → header berubah → logout; dev server server:4000 jalan berdampingan dengan vite
- [ ] AGENTS.md: catat pola integration (proxy vs cross-origin, baseURL, env vars)

## Next Step
Pilih milestot (rekomendasi M1) → update di atas + jalankan M1.1.

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
