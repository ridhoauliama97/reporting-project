# Reporting Dashboard

Dashboard reporting (frontend-only) berbasis **Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui** dengan 14 halaman analisis pembelian. Seluruh angka berasal dari dataset nyata (`purchase-data.json`, ±3.010 baris invoice) — tanpa data tiruan.

## Fitur

- 14 halaman analisis: Ringkasan Pembelian, Pembelian per Supplier, Delivery, Riwayat Harga, Varians, Tren Biaya Material, Alert Kenaikan Harga, Lead Time, Peringkat & Scorecard Supplier, dll.
- Filter rentang tanggal (`DateFilter`) yang menggerakkan semua widget, tabel, dan chart di setiap halaman.
- `DataTable` dengan pencarian, header yang bisa diurutkan, paginasi, ekspor **CSV / Excel / PDF**, dan toggle kolom (dikelompokkan per kategori).
- Baris total otomatis pada tabel Ringkasan Pembelian (sesuai data halaman yang tampil).
- Dark mode (`ThemeToggle`, tersimpan di `localStorage`).
- Responsif penuh mengikuti spesifikasi `polish.md` (breakpoint 375/640/1024, tabel scroll horizontal dengan kolom pertama sticky).

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Chart | Recharts |
| Routing | React Router |

## Struktur Proyek

```
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui (button, card, chart, sidebar, table, ...)
│   │   ├── dashboard/     # AppSidebar, SiteHeader, SectionCards
│   │   ├── DataTable.tsx  # tabel sortable/exportable + toggle kolom
│   │   ├── DateFilter.tsx # filter rentang tanggal
│   │   ├── StatCard.tsx   # kartu KPI
│   │   └── ...
│   ├── pages/             # 14 halaman + WarehousePlaceholder
│   ├── utils/formatters.ts # parseAllItems, formatRupiah, formatPercent, filterByDateRange
│   ├── types/purchase.ts
│   └── data/purchase-data.json
└── ...
```

## Memulai

```bash
cd dashboard
npm install
npm run dev       # dev server (host: true, port 5173)
npm run lint      # oxlint
npm run build     # tsc -b (typecheck) + vite build
npm run preview   # preview build produksi
```

## Catatan Data

- Field numerik (`quantity`, `unitCost`, `netTotal`, `poPiDays`, dll.) berbentuk **string** di JSON — gunakan `parseAllItems()` (`utils/formatters.ts`) sebelum diproses.
- `parsePurchaseItem()` mengubah string kosong `""` menjadi `0`, sehingga halaman memakai guard `> 0` (bukan null check). Nilai kosong tampil sebagai `-`.
- Hanya transaksi invoiced (PI/PN/PURBB); tidak ada data penerimaan barang, QC, atau reject.
- Halaman Supplier Quality, Outstanding/Open/Closed PO adalah placeholder (`EmptyState`) — tidak ada angka yang dibuat-buat.

## CI

GitHub Actions (`.github/workflows/ci.yml`) menjalankan `npm run lint` dan `npm run build` pada setiap push ke `main` dan pull request.
