# Phase 3 — Wiring app ke 2 dataset + bersihkan

## Wiring
- `data-loader.worker.ts`: terima 2 URL (atau 2 worker) → gabung records kedua file.
- `App.tsx`: fetch `purchasing-data.json` + `warehouse-data.json`; split `parseAll*` per recordType
  (purchase/po/pr dari purchasing; stock/transfer/adjustment/usage/production* dari warehouse).
- Route warehouse placeholder (CycleCount/Picking/Packing) → tetap `EmptyState` (tanpa data).

## Implementasi laporan baru dari Production (faktual)
- `WarehouseProductivity`: dari `production` (qty/COG per line/machine/operator per tanggal).
- `WarehouseUtilization`: dari `production` (jam produksi / machine / line).
- Optional: `StockMovement` bisa tampilkan produksi masuk/keluar dari `productionOutput`/`productionMaterial`.

## Bersihkan folder
- Hapus: `purchase-data.json`, `purchasing-report-data.json`, `purchase-request.json`, dan file sumber 8 lama.
- `dashboard/src/data` → HANYA `purchasing-data.json` + `warehouse-data.json`.

## Verifikasi phase (TRUE)
- `npm run lint` + `npm run build` hijau.
- `git status -- dashboard/src/data` hanya 2 file baru.
- Route Purchasing memakai purchasing-data; route Warehouse memakai warehouse-data (spot-check konsol/devtools).