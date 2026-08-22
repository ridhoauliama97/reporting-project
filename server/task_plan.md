# Task Plan — Auth Backend (`/server`) + Next Milestones

**Goal (achieved):** Auth service Express 5 + better-auth + PostgreSQL di `server/` — register/login/session/protected endpoint berfungsi, CORS lintas-origin siap (dipanggil dari http://localhost:5173).

## COMPLETED (archive, v1)
- P1 Scaffold — package.json (Express 5.2.1, better-auth 1.7.1, drizzle-orm 0.45.2, pg, tsx, tsc) + tsconfig NodeNext + .env(.example) + DB `db_reporting` created (`postgres://postgres:password@localhost:5432/db_reporting`) + GET /api/health 200
- P2 DB layer — schema via `npx auth@latest generate` (canonical v1.7: `account.issuer NOT NULL`, FK indexes, unique email/token); migration 0000+0001 applied; 4 tables
- P3 Auth service — `src/auth.ts` betterAuth (emailAndPassword + trustedOrigins env) + `toNodeHandler` mount `/api/auth/*splat`
- P4 Guard — `GET /api/me` (auth.api.getSession), 401/200 verified
- P5 Cross-origin — `cors` middleware (origin=BETTER_AUTH_TRUSTED_ORIGINS, credentials) + docs/AGENTS + commits lokal a0af383/0e5a1bc/269f9c7 (belum dipush)

## Current Phase Summary
- **Status:** M2 COMPLETE; berikutnya M3 Pengaturan profil
- Kandidat lain (belum dipilih): M3 login sosial, M4 README endpoint"
- **RINGKASAN STATUS**: M1 telah di-push & live (production v1.18.0); auth dasar berjalan penuh

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
M3.1: route /settings di dashboard (form nama/email/password/hapus akun).

## Milestone M2 — Email Verification + Reset Password (in_progress)
**Goal:** Daftar mengirim email verifikasi; lupa-password mengirim email reset dengan token; alur diverifikasi penuh secara lokal (tanpa SMTP asli — transport dev mencatat link ke konsol).

### M2.1: Mailer abstraction (complete)
**Status:** complete
- [ ] npm i nodemailer (+ @types) di server/
- [ ] src/mailer.ts: transport dari env SMTP_HOST/PORT/USER/PASS/SECURE; bila env kosong → dev transport (log email JSON + tombol/link langsung, TIDAK mengirim ke internet)
- [ ] src/auth.ts: emailAndPassword.sendResetPassword + emailVerification.sendVerificationEmail memakai mailer (template text ID)
- [ ] .env(.example): tambah SMTP_* + (opsional) EMAIL_FROM; BETTER_AUTH_REDIRECT_URL=http://localhost:5173

### M2.2: Flow verifikasi + reset di server
**Status:** pending
- [ ] emailVerification.enabled; requireEmailVerification=false (login tetap terbuka via dashboard sendiri)
- [ ] Konfirmasi route `/api/auth/verify-email`, `/request-password-reset`, `/reset-password/:token` (sudah milik better-auth)
- [ ] Verifikasi curl: email log berisi link token; reset memakai token → password baru tersimpan (re-login sukses)

### M2.3: Alur di dashboard
**Status:** pending
- [ ] Login.tsx: pesan "email verifikasi dikirim" setelah daftar + link "Lupa password?" → halaman reset
- [ ] Halaman /reset-password (di luar Layout): form 1 (email → kirim link) & form 2 (token+password baru, dari query)
- [ ] redirect verify-email → /dashboard (BETTER_AUTH_REDIRECT_URL) + state sukses/expired
- [ ] Playwright E2E: daftar → ambil link dari log server → verifikasi → reset password → login baru

### M2.4: Verify + docs
**Status:** pending
- [ ] lint+build server & dashboard; commit lokal; AGENTS.md catat konfigurasi email (SMTP env, dev transport)

## Milestone M3 — Pengaturan Profil (setelah M2)
**Goal:** Halaman /settings di dashboard — ubah nama, email (via verifikasi email M2), password, hapus akun.

### M3.1: UI Pengaturan
**Status:** pending
- [ ] Route /settings (di dalam Layout); link dari user-menu item "Pengaturan"
- [ ] Form: nama (update-user), email (change-email → kirim verifikasi M2), password (change-password), hapus akun (delete-user + konfirmasi)
- [ ] Setelah aksi: refresh sesi (pola refresh-on-open M1)

### M3.2: Verify + docs
**Status:** pending
- [ ] Playwright: ganti nama → header update; ganti password → re-login; delete → session hilang
- [ ] AGENTS.md + commit lokal

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
