# Findings — Auth Backend (`/server`)

## Environment (verified)
- Node v24.18.0, npm 11.16.0 (npm 11 mendukung allow-scripts dsb.)
- PostgreSQL: `pg_isready` → `localhost:5432 - accepting connections`; psql ada di `/usr/bin/psql`; **tidak ada docker** (pakai Postgres native)
- Server di-fetch sudah tidak ada isi; `/server` kosong
- Root `.gitignore` saat ini: node_modules/, dist/, logs/, *.log, npm-debug.log*, .vscode/, .idea/ — **tidak ada entri `.env`** → wajib ditambah coverage server/.env (dan .env.*) sebelum commit

## Owner-provided credentials (local dev defaults, dari AGENTS.md)
- Database: `db_reporting`, user `postgres`, password `password`
- Connection string: `postgres://postgres:password@localhost:5432/db_reporting`
- Wajib dipakai persis; tidak boleh invent kredensial lain

## Stack decisions (user-approved)
- Express 5 (`express@5`); TypeScript; tsx untuk dev (`tsx watch`), tsc untuk build
- **better-auth** untuk auth (email/password + session default), di-integrasikan ke Express via `expressAuth` dari `better-auth/express`
- **drizzle-orm + drizzle-kit** dengan driver `node-postgres` (pg): better-auth memakai adapter drizzle; migration digenerate dari skema ke folder `drizzle/`

## better-auth facts (verified via installed skill)
- Skill `better-auth-best-practices` (98K installs) tersedia di `~/.agents/skills/better-auth-best-practices/` — baca sebelum menulis src/auth.ts (field list tabel bisa berubah per versi; skill memuat konfigurasi terbaru)
- Tabel default (Postgres, via drizzle): `user`, `session`, `account`, `verification`
- Export yang dipakai: `betterAuth()` dari `better-auth`; `drizzleAdapter` dari `better-auth/adapters/drizzle`; `expressAuth` dari `better-auth/express`; helper `getSession`/`headers` dari `better-auth/cookie` (atau `fromNodeHeaders` — cek catatan skill saat Phase 3)
- Endpoint default (`/api/auth/*`): `sign-up/email`, `sign-in/email`, `sign-out`, `get-session`, dll.

## Repo conventions to respect
- AGENTS.md sudah punya section "Backend (/server) — Auth, Planned" — setelah server jadi, update section itu (jangan biarkan klaim "empty" basi)
- Jangan commit secret; `npm run lint`/`build` dari `dashboard/` tidak menyentuh server — server punya alur verifikasi sendiri (tsc + curl)
- Revers repo: semua command git dari root repo
