# Phase 2 — Pipeline data: 12 mentah → purchasing-data.json + warehouse-data.json

## Generator
Tulis ulang `dashboard/scripts/build-report-data.mjs`:
1. Baca 12 file dari `C:/Users/ridho/Desktop/data` (path via arg/env, jangan hardcode di app).
2. Decode header SSRS: `_x0028_`→`(`, `_x0029_`→`)`, `_x002F_`→`/`, `_x0025_`→`%` (rebuild row keys).
3. Emit **purchasing-data.json** (flat records `recordType`):
   - `purchase` ← PurchaseByItem + join PurchaseOrderByItem (poDate/poExpectedDate) + PurchaseRequestByItem
     (prDate/requiredDate) → hitung `poPiDays`, `prPiDays`, `poPiOverdueDays`.
   - `po` ← PurchaseOrderByItem (status dari Major-UOM qty; `qtyOutstanding`, `pctDelivered`).
   - `pr` ← PurchaseRequestByItem.
4. Emit **warehouse-data.json** (flat records):
   - `stock` ← StockBalance; `transfer` ← GoodsTransferByItem; `adjustment` ← AdjustmentByItem;
     `usage` ← UsageByItem; `production` ← Production;
     `productionMaterial` ← ProductionMaterialUsedByItem; `productionOutput` ← ProductionOutputByItem.
5. Format field mengikuti referensi `fix/laporan-purchasing` (`purchase-data.json`): numerik=angka, tanggal=ISO.

## Audit per-file (faktual atau tidak)
| # | File | Keputusan |
|---|---|---|
| 1–10 | lihat PROJECT.md | mapping (tabel di atas) |
| 11 StockActivitiesSummary | metadata `{test,Table1}` → **tidak bisa** → lapor |
| 12 Outstanding_PR_by_hod | ringkasan HOD → **tidak punya laporan** → lapor |
| Cycle/Picking/Packing | tanpa sumber → **EmptyState** → lapor |

## Verifikasi phase (TRUE)
- Skrip audit show: jumlah records per recordType (purchase≥3284, po, pr, stock 2886, transfer 7879,
  adjustment 856, usage 7001, production 45046, dst).
- Field spot-check numerik & tanggal untuk tiap tipe.
- Tidak ada header `_x00XX_` tersisa di output.