# Phase 1 — Gabung struktur laporan + pertahankan auth

## Persiapan
- Buat branch kerja: `git checkout -b feat/data-migration origin/fix/laporan-purchasing`
- Kejar main: `git merge main` (atau rebase jika bersih); siapkan resolusi konflik.

## Aturan resolusi konflik (file per file)
- Menang "branch" (laporan): `src/pages/*`, `src/types/purchase.ts`, `src/utils/formatters.ts`,
  `src/utils/analytics.ts`, `src/utils/reports.ts`, `src/components/dashboard/nav-config.tsx`,
  `src/data-loader.worker.ts`, `src/components/page shell` (PageLayout/TopBarChart/dst).
- Menang "main" (auth/infra): `src/lib/auth-client.ts`, `src/components/RequireAuth.tsx`,
  `src/components/dashboard/user-menu.tsx`, `src/pages/Login.tsx`, `src/pages/ResetPassword.tsx`,
  `src/pages/Settings.tsx`, `vercel.json` (proxy `/api`), `.env.local` (VITE_AUTH_URL), CI files, `server/`.
- Manual-merge: `src/App.tsx` (tambah route `/login`, `/reset-password`, `/settings`, bungkus RequireAuth,
  tetap pakai route report + worker 2-dataset nanti di Phase 3), `src/components/Layout.tsx`
  (bawa user-menu dari main + header report dari branch).

## Verifikasi phase (TRUE)
- `npm run lint` hijau.
- `npm run build` hijau.
- Playwright smoke: buka `/login` → login → sampai `/dashboard`; cookie session ada; header tampil nama.
- `/docs` & `/login` & `/reset-password` boleh tanpa RequireAuth; sisanya wajib login.
- Semua 33 route (16+17) tersedia (render `LoadingScreen`/empty ok, data belum final di phase ini).