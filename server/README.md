# Reporting Auth Service (`server/`)

Auth service untuk dashboard **Database Report** — Express 5 + better-auth + PostgreSQL. Frontend (Vite, `dashboard/`) tetap self-contained; API ini dipakai oleh halaman login & pengaturan akun.

## Prasyarat

- Node.js 22+ (dikembangkan di v24)
- PostgreSQL — database `db_reporting` (owner default: `postgres://postgres:password@localhost:5432/db_reporting`)
- `.env` dari `.env.example` (jangan commit `.env` — sudah di-ignore)

## Menjalankan

```bash
npm install
npm run dev         # tsx watch (port 4000)
npm run build       # tsc → dist/
npm start           # node dist/index.js
npm run db:generate # buat migration baru setelah ubah src/db/schema.ts
npm run db:migrate  # apply migration ke database
```

Uji cepat: `curl http://localhost:4000/api/health` → `{"status":"ok","service":"reporting-auth"}`.

## Endpoint Auth (base `/api/auth`)

Semua di-mount via Express 5: `app.all("/api/auth/*splat", toNodeHandler(auth))`.

### Akun
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/sign-up/email` | Daftar dengan email/password (kirim email verifikasi) |
| POST | `/api/auth/sign-in/email` | Masuk → set cookie session |
| POST | `/api/auth/sign-out` | Keluar |
| GET | `/api/auth/get-session` | Cek sesi aktif |
| POST | `/api/auth/update-user` | Update profil (nama) |
| POST | `/api/auth/change-email` | Ganti email (kirim verifikasi ke email baru) |
| POST | `/api/auth/change-password` | Ganti password (butuh password saat ini) |
| POST | `/api/auth/delete-user` | Hapus akun (butuh `password` bila sesi tidak fresh) |

### Sesi
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/auth/list-sessions` | Daftar sesi aktif |
| POST | `/api/auth/revoke-session` | Cabut satu sesi |
| POST | `/api/auth/revoke-other-sessions` | Cabut sesi lain |

### Email / Verifikasi
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/request-password-reset` | Kirim link reset ke email |
| POST | `/api/auth/reset-password` | Set password baru (body `{ newPassword, token }`) |
| GET | `/api/auth/verify-email?token=…&callbackURL=…` | Verifikasi email (redirect ke callbackURL) |
| POST | `/api/auth/send-verification-email` | Kirim ulang email verifikasi |
| GET | `/api/auth/reset-password/:token?callbackURL=…` | Variant callback (lintas origin) |

### Lainnya (fitur belum diaktifkan)
`/api/auth/sign-in/social`, `/api/auth/callback/*`, `/api/auth/link-social`, account info dsb. — butuh konfigurasi provider OAuth. `/api/auth/error` — halaman error bawaan.

### Kustom
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/me` | Data user+session dari sesi HTTP (401 bila tanpa cookie) |

## Email (SMTP vs dev)

- `src/mailer.ts` memakai env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- **Tanpa `SMTP_HOST`** → *dev transport*: email tidak dikirim, dicetak ke konsol server:
  `[mailer DEV] LINK: <url>` — ambil link dari sini untuk testing lokal tanpa SMTP.

## Integrasi Dashboard

- Halaman `/login`, `/reset-password`, `/settings` di `dashboard/src/pages/` (lihat `src/lib/auth-client.ts`)
- Base URL API: `VITE_AUTH_URL` (default `http://localhost:4000`); CORS whitelist origin di `BETTER_AUTH_TRUSTED_ORIGINS` (default `http://localhost:5173`)
- Verifikasi/reset link dibangun menuju `BETTER_AUTH_REDIRECT_URL` (dashboard)
- Getuhan penting lain: lihat AGENTS.md → "Dashboard Auth Integration".

## Struktur

```
server/
├── src/
│   ├── index.ts      # Express: CORS, auth handler, /api/health, /api/me
│   ├── auth.ts       # betterAuth config (emailAndPassword, emailVerification, user.deleteUser)
│   ├── mailer.ts     # SMTP / dev-console transport
│   └── db/
│       ├── pool.ts   # pg Pool + drizzle
│       └── schema.ts # tabel auth (generate via `npx auth@latest generate`)
├── drizzle/          # migration SQL (commit!)
├── drizzle.config.ts
└── .env.example
```
