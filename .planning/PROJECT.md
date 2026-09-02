# PROJECT: Migrasi Data & Struktur Laporan Dashboard

## Visi
Dashboard (`dashboard/`) sepenuhnya disuplai oleh **12 JSON di `C:\Users\ridho\Desktop\data`** sebagai data mentah,
diolah menjadi **2 file data final** di `dashboard/src/data`:
- `purchasing-data.json` → seluruh laporan menu **Purchasing** (16) + Dashboard + Analytics
- `warehouse-data.json` → seluruh laporan menu **Warehouse** (17)

Struktur menu & laporan = **perseley dari `origin/fix/laporan-purchasing`** (sudah ada 16 Purchasing + 17 Warehouse).
Auth/supabase/CI **tidak boleh rusak** — digabung dari `main`.

## Non-Negotiable
1. `dashboard/src/data` hanya berisi `purchasing-data.json` dan `warehouse-data.json` setelah selesai.
2. Setiap laporan harus berisi data **faktual** hasil olahan 12 file mentah. Kalau satu file tidak bisa diolah
   menjadi laporan yang faktual → laporan tsb tampil **EmptyState**, dan ini **dilaporkan ke user** (tidak dikarang).
3. Sidebar: 16 Purchasing + 17 Warehouse dari `fix/laporan-purchasing`.
4. Auth (login, RequireAuth, settings, reset-password, proxy same-origin `/api`) tetap jalan. Tidak ada error
   auth/supabase saat dev, build, maupun deploy.

## Sumber Data Mentah (12)
| # | File Desktop | Baris | Status |
|---|---|---|---|
| 1 | AnlReports_Inventory_PurchaseByItem | 3.284 | dipakai → `purchase` |
| 2 | AnlReports_Inventory_PurchaseOrderByItem | 3.220 | dipakai → `po` |
| 3 | AnlReports_Inventory_PurchaseRequestByItem | 2.914 | dipakai → `pr` (join lead-time) |
| 4 | AnlReports_Inventory_UsageByItem | 7.001 | dipakai → `usage` |
| 5 | AnlReports_Inventory_StockBalance | 2.886 | dipakai → `stock` |
| 6 | AnlReports_Inventory_GoodsTransferByItem | 7.879 | dipakai → `transfer` |
| 7 | AnlReports_Inventory_AdjustmentByItem | 856 | dipakai → `adjustment` |
| 8 | AnlReports_Inventory_Production | 45.046 | dipakai → `production` (utk Warehouse Productivity/Utilization) |
| 9 | AnlReports_Inventory_ProductionMaterialUsedByItem | 13.127 | dipakai → `productionMaterial` |
| 10 | AnlReports_Inventory_ProductionOutputByItem | 1.677 | dipakai → `productionOutput` |
| 11 | AnlReports_Inventory_StockActivitiesSummary | metadata `{test,Table1}` | BUKAN tabel data → tidak bisa jadi laporan (lapor ke user) |
| 12 | Outstanding_Purchase_Request_by_hod | 93 (ringkasan HOD) | ringkasan, bukan sumber laporan → lapor ke user |

## Yang Kemungkinan TIDAK Bisa Faktual
- **Cycle Count Accuracy**, **Picking Accuracy**, **Packing Accuracy** — tak ada kolom sumbernya di 12 file
  (tidak ada data count/picking/packing). Tetap EmptyState + dilaporkan.