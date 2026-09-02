# REQUIREMENTS (terukur)

R1 — Folder data bersih
- TRUE: `dashboard/src/data` berisi TEPAT 2 file: `purchasing-data.json`, `warehouse-data.json`.
- Verification: `ls dashboard/src/data` == 2 file. Generator baca dari `C:/Users/ridho/Desktop/data`.

R2 — Struktur sidebar = `fix/laporan-purchasing`
- TRUE: NAV_GROUPS = Dashboard(1) + Purchasing(16) + Warehouse(17), ikon/title sama persis dgn branch.
- Verification: diff `nav-config.tsx` thd branch == tanpa perubahan mencolok.

R3 — Semua 33 laporan berisi data faktual ATAU EmptyState jujur
- TRUE: tiap route laporan render angka dari `purchasing-data.json`/`warehouse-data.json`.
- TRUE untuk 3 laporan tanpa sumber (CycleCount/Picking/Packing): EmptyState + keterangan (bukan `0`/karangan).
- Verification: jalankan app, cek tiap route; skrip audit menampilkan sumber tiap laporan.

R4 — Auth tidak error
- TRUE: `/login` login sukses → cookie `__Secure-better-auth.session_token` → lancar ke `/dashboard`.
- TRUE: `/settings`, `/reset-password`, `/docs`, semua route laporan terlindungi RequireAuth (kecuali `/docs`, `/login`, `/reset-password`).
- TRUE: vercel.json proxy `/api` tetap ada; `auth-client.ts` baseURL same-origin.
- Verification: `npm run build` + lint; Playwright E2E login (cookie + get-session 200).

R5 — Data final valid
- TRUE: recordType lengkap (purchase, po, pr, stock, transfer, adjustment, usage, production, productionMaterial, productionOutput).
- TRUE: field numerik = angka, tanggal = ISO (parser `parseISO` OK), SSRS header ter-decode.
- TRUE: status PO OPEN/OUTSTANDING/CLOSED dihitung dari kolom Major-UOM qty.
- Verification: node skrip audit (counts + field-type spot check) + `npm run build`.

R6 — Kinerja
- TRUE: 2 dataset dimuat via Web Worker `?url` (tidak melebar ke bundle utama).
- Verification: bundle size tetap skala sama; build lolos.

R7 — Tidak ada data lama tertinggal
- TRUE: `purchase-data.json`, `purchasing-report-data.json`, file sumber 8 lama, `purchase-request.json`
  tidak lagi ada di `dashboard/src/data`.
- Verification: `ls` + `git status`.