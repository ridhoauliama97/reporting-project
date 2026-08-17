# Prompt untuk Lovable — Dashboard Purchasing (Full Build, Single Prompt)

Build a purchasing dashboard app with a **sidebar navigation**. The sidebar has one menu group, **"Purchasing"**, containing 14 submenu links. Clicking a submenu navigates to its own page with stat widgets + a table/chart. This is a **frontend-only** build, but use the **real dataset provided** (`purchase-data.json`, attached — 3,010 real purchase invoice line items) — do NOT use mock/dummy data. Import the JSON into the project (e.g. `src/data/purchase-data.json`). All UI labels in Indonesian.

---

## Dataset (`purchase-data.json`)

Array of ~3,010 objects, one per purchase invoice line item. Fields:

`purchaseNumber, purchaseType, purchaseDate, dueDate, prNumber, prDate, poNumber, poDate, poExpectedDate, poPiDays, prPiDays, poPiOverdueDays, referenceNumber, transitStatus, supplierCode, supplierName, itemCode, itemName, itemCategory, itemType, uom, warehouse, qtyOrdered, quantity, unitCost, poUnitCost, netTotal, requestedBy, usedBy, poCreator, poApprovedBy`

- `itemCategory` is exactly one of 5 values: `BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`.
- Numeric-looking fields (`quantity`, `unitCost`, `poUnitCost`, `netTotal`, `qtyOrdered`, `poPiDays`, `prPiDays`, `poPiOverdueDays`) are stored as **strings** — parse to `Number` before any math.
- Empty string `""` means no value in the source — show as `-` in the UI, exclude from averages/counts where relevant.
- **Data limitation**: this dataset only contains lines that are **already invoiced** (types PI/PN/PURBB). There is no goods-receiving data (no arrival/received-quantity fields) and no QC/reject data. Do not fabricate these for the pages that would need them — build those as clearly-labeled placeholders (see #4, #11, #12, #13 below).

Every non-placeholder page has its own **date range filter** (based on `purchaseDate` unless a page says otherwise) that drives its widgets/table/chart live. Currency always formatted as Rupiah (`Rp 1.234.567`), percentages to 1 decimal.

---

## Sidebar — "Purchasing" (14 items, in this order)

### 1. Purchase Summary
**Widgets** (6 cards): sum of `netTotal` in the selected date range, one per `itemCategory` — **Bahan Baku, Bahan Pendukung, Sparepart, WIP** (=`WORK IN PROGRESS`), **Barang Dagang** (=`BARANG DAGANG`) — plus **Grand Total** (sum of all 5, visually distinct/accent color). Each card also shows a small secondary line with transaction count for that category.
**Table** below: all filtered line items. Add a "Kolom" button/dropdown with checkboxes to show/hide columns, grouped:
- Transaksi: purchaseNumber, purchaseType, purchaseDate, dueDate, poNumber, poDate, referenceNumber, transitStatus
- Supplier: supplierCode, supplierName
- Item: itemCode, itemName, itemCategory, itemType, uom
- Gudang: warehouse
- Kuantitas & Nilai: quantity, unitCost, netTotal
- PIC: requestedBy, usedBy, poCreator, poApprovedBy

Use readable Indonesian labels (e.g. "Nomor Purchase") even though JSON keys are camelCase. Default visible columns: purchaseNumber, purchaseDate, supplierName, itemName, warehouse, quantity, uom, netTotal.
Table UX: search box (itemName/supplierName/purchaseNumber), sortable headers, pagination (20–50 rows/page), right-align numeric columns.

### 2. Purchase by Supplier
**Widgets** (4 cards): Total Pembelian (sum `netTotal`), Jumlah Supplier Aktif (distinct `supplierName`), Rata-rata Pembelian per Supplier, Supplier Terbesar (nama + nilai tertinggi).
**Table**: grouped by `supplierName` — Nama Supplier, Jumlah Transaksi, Total Kuantitas, Total Pembelian (Rp), % dari Grand Total. Sort by Total Pembelian desc.

### 3. Supplier Ranking
**Widgets** (4 cards): Top 1 Supplier, Top 5 Suppliers gabungan (sum + %), Jumlah Supplier dalam periode, Rata-rata nilai per supplier.
**Chart**: horizontal bar — Top 10 suppliers by sum `netTotal`, descending.
**Table**: Rank, Nama Supplier, Total Pembelian (Rp), Jumlah Transaksi, % Kontribusi. Sortable, default sort Total Pembelian desc.

### 4. Supplier Quality — *placeholder*
Empty-state page: icon + "Data kualitas supplier (reject/QC) belum tersedia di sumber data saat ini." Keep date filter + empty widget row ("–") + empty table shell for structural consistency — no fabricated numbers.

### 5. Supplier Delivery Performance
Proxy metric using `poPiDays`/`poPiOverdueDays` (PO→Invoice days, not actual goods receipt). Add a small info note on the page: "Diukur dari selisih PO ke Invoice, karena data tanggal barang diterima belum tersedia."
**Widgets** (4 cards): Rata-rata Hari PO→Invoice, Jumlah Transaksi Terlambat (`poPiOverdueDays` > 0), % Tepat Waktu, Supplier Paling Lambat.
**Table**: grouped by `supplierName` — Nama Supplier, Rata-rata Hari PO→Invoice, Rata-rata Hari Overdue, Jumlah Transaksi Terlambat, Jumlah Transaksi Total. Sort by Rata-rata Hari Overdue desc.

### 6. Purchase Price History
Add an item search/select dropdown (by `itemName`) alongside the date filter.
**Widgets** (4 cards, for selected item): Harga Terakhir, Harga Terendah, Harga Tertinggi, Rata-rata Harga.
**Chart**: line chart of `unitCost` over `purchaseDate` for the selected item.
**Table**: Tanggal Purchase, Nomor Purchase, Nama Supplier, Kuantitas, Harga Satuan, Total Netto — sort by tanggal desc.
If no item selected: show prompt state "Pilih item untuk melihat riwayat harga."

### 7. Purchase Variance
Quantity variance: `variance = quantity - qtyOrdered` per row (only where `qtyOrdered` is non-empty/non-zero).
**Widgets** (4 cards): Jumlah Baris dengan Variance, Total Selisih Kuantitas, Item dengan Variance Terbesar, % Baris Bervariance dari Total.
**Table**: only rows where variance ≠ 0 — Tanggal Purchase, Nomor Purchase, Nama Item, Nama Supplier, Qty Ordered, Qty Invoiced, Selisih (red if short, green if over).

### 8. Material Cost Trend
Scope: all 5 `itemCategory` values (`BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`). Category checkbox filter (all checked by default) alongside date range; chart & table follow checked categories.
**Widgets** (4 cards): Total Biaya Pembelian, Rata-rata Biaya per Bulan, Bulan dengan Biaya Tertinggi, Trend vs Bulan Lalu (%).
**Chart**: line/area — total `netTotal` by month (from `purchaseDate`), one line per checked category.
**Table**: Bulan, one column per checked category (Rp), Total (Rp).

### 9. Price Increase Alert
Per `itemName`, sort purchases by `purchaseDate`; compare each `unitCost` to the previous purchase of the same item. Flag if increase ≥ threshold (configurable input, default 10%).
**Widgets** (4 cards): Jumlah Item Naik Harga, Rata-rata Kenaikan (%), Kenaikan Tertinggi (item + %), Item Terpantau (unique items with ≥2 price points).
**Table**: only flagged items — Nama Item, Nama Supplier, Tanggal Sebelumnya, Harga Sebelumnya, Tanggal Terbaru, Harga Terbaru, Kenaikan (%) — highlighted row by severity.

### 10. Purchase Lead Time
**Widgets** (4 cards): Rata-rata Lead Time PR→Invoice (avg `prPiDays`), Rata-rata Lead Time PO→Invoice (avg `poPiDays`), Lead Time Tercepat, Lead Time Terlama. Label precisely — only these two ready-made lead-time fields exist, don't invent a separate PR→PO-only figure.
**Chart**: histogram of `poPiDays` buckets (0-3 hari, 4-7 hari, 8-14 hari, 15+ hari).
**Table**: Nomor PR, Tanggal PR, Nomor PO, Tanggal PO, Nomor Purchase, Tanggal Purchase, Lead Time PR→Invoice (hari), Lead Time PO→Invoice (hari). Sort by Lead Time PO→Invoice desc.

### 11. Outstanding PO — *placeholder*
Empty-state: "Status PO yang belum ter-invoice tidak dapat dihitung dari data ini — laporan ini hanya berisi transaksi yang sudah ter-invoice (PI/PN/PURBB)." Keep sidebar link + page shell.

### 12. Open PO — *placeholder*
Same empty-state treatment and message as #11.

### 13. Closed PO — *placeholder*
Same empty-state treatment and message as #11.

### 14. Supplier Scorecard
Composite score per supplier from **two** available dimensions only (no Quality — subtitle note: "Skor berbasis Harga & Ketepatan Waktu — dimensi Kualitas belum tersedia").
- **Skor Harga** (0-100): based on frequency/severity of price increases ≥10% (from #9 logic) — fewer/smaller increases = higher score.
- **Skor Ketepatan Waktu** (0-100): % of transactions with `poPiOverdueDays` <= 0.
- **Skor Total** = average of the two.
**Widgets** (4 cards): Supplier Skor Tertinggi, Supplier Skor Terendah, Rata-rata Skor Total, Jumlah Supplier Dinilai.
**Table**: Nama Supplier, Skor Harga, Skor Ketepatan Waktu, Skor Total, Rating badge (Excellent ≥80, Good 60-79, Perlu Perhatian <60). Sort by Skor Total desc.

---

## Shared UI conventions
- Sidebar "Purchasing" group with all 14 links in the order above, relevant icon per item.
- Every non-placeholder page: date filter → stat widget cards row → chart and/or table below, consistent styling across pages.
- Placeholder pages (#4, #11, #12, #13) keep the same page shell (title, date filter, "–" widgets, empty table) for structural consistency — just no invented numbers.
- Clean, modern SaaS dashboard style — card widgets with soft shadow/border, clear typography hierarchy, responsive layout.
