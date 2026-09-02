# ROADMAP

## Phase 1 — Gabung struktur laporan `fix/laporan-purchasing` + pertahankan auth `main`
Goal: satu kodepangkat utuh = sidebar 16+17 dari branch, auth tetap jalan.
TRUE ketika: `npm run lint` & `npm run build` hijau; `/login`→login→`/dashboard` sukses; semua route report ada.
- Base: branch baru `feat/data-migration` dari `origin/fix/laporan-purchasing`.
- Merge `main`; resolusi konflik: file report/types/formatters/pages/worker → branch; file auth/proxy/server/ci → main.
- App.tsx & Layout manual-merge (route auth + route report + RequireAuth).
- Verifikasi: build, lint, smoke Playwright login.

## Phase 2 — Pipeline data: 12 mentah → 2 file final
Goal: `src/data` sisa 2 file; tiap laporan dapat data faktual atau EmptyState jujur.
TRUE ketika: generator jalan dari Desktop/data, output `purchasing-data.json` + `warehouse-data.json`,
count record sesuai, tiap-recordType cocok dgn referensi format branch (`purchase-data.json`).
- Tulis ulang `scripts/build-report-data.mjs` (SSRS decode, join untuk lead-time, mapping 12 file).
- Audit tiap 12 file: bisa faktual? → mapping; tidak → catat placeholder + report.
- Jalankan, audit counts/field.

## Phase 3 — Wiring app ke 2 dataset + bersihkan folder
Goal: app memuat 2 dataset via worker; semua route render; folder data hanya 2 file.
TRUE ketika: lint+build hijau, menu Purchasing pakai `purchasing-data.json`, menu Warehouse pakai `warehouse-data.json`,
tidak ada file lama.
- Adapt `data-loader.worker.ts` + App (fetch 2 URL), hapus `purchase-data.json`/old sources.
- Verifikasi lint + build + render.

## Phase 4 — Verifikasi + laporan ke user
Goal: semua menu diverifikasi; laporan file yang tidak bisa dipetakan disampaikan.
TRUE ketika: E2E login ok; audit per-menu berisi data faktual/EmptyState; ringkasan jelas utk user.
- Audit per-route (tombol menu demi menu), cek angka = data nyata.
- Tulis ringkasan: file 10 dipakai, file 11 & 12 (metadata/ringkasan) + 3 laporan (Cycle/Picking/Packing) = EmptyState + alasan.