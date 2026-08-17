# Reporting Dashboard

Dashboard reporting (frontend-only) berbasis **Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui** dengan 14 halaman analisis pembelian ditambah **Reports & Exports**, **Analytics & AI Insights**, dan **pusat dokumentasi** (`/docs`). Seluruh angka berasal dari dataset nyata (`purchase-data.json`, ±3.010 baris invoice) — tanpa data tiruan.

## Fitur

- **16 item menu Purchasing**: 14 laporan analisis (Ringkasan Pembelian, Pembelian per Supplier, Ranking & Scorecard Supplier, Delivery, Riwayat Harga, Varians, Tren Biaya Material, Alert Kenaikan Harga, Lead Time, dst.) + Reports & Exports + Analytics & AI Insights.
- **Analytics & AI Insights** — mesin analisis rule-based deterministik: ringkasan AI per laporan, rekomendasi keputusan (Info/Perhatian/Urgent), deteksi anomali, analisis pengeluaran & potensi hemat, dan chat Q&A ("Tanya Data").
- **Reports & Exports** — akses & ekspor semua laporan dalam satu tempat, digerakkan 1 Date Filter.
- **Filter rentang tanggal** (`DateFilter`) yang menggerakkan semua widget, tabel, dan chart di setiap halaman.
- **DataTable** dengan pencarian, header yang bisa diurutkan (termasuk kolom No), paginasi, ekspor **CSV / Excel / PDF**, dan toggle kolom (dikelompokkan per kategori). Saat tabel lebar, kolom sticky di awal tetap tertambat dengan bayangan transisi saat di-scroll.
- **Documentation / Knowledge Hub** (`/docs`) — dokumentasi lengkap per halaman dalam markdown, navigasi 2 level (Menu → Submenu), pencarian, dan glosarium istilah.
- **Baris total otomatis** pada tabel Ringkasan Pembelian (sesuai data halaman yang tampil).
- **Dark mode** (`ThemeToggle`, tersimpan di `localStorage`).
- **Versi dinamis** — versi aplikasi (footer sidebar) dihitung otomatis dari riwayat commit, ter-deploy otomatis ke Vercel via CI/CD.
- Responsif penuh mengikuti spesifikasi `polish.md` (breakpoint 375/640/1024, tabel scroll horizontal dengan kolom pertama sticky).

## Tech Stack

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Chart | Recharts |
| Routing | React Router |
| Markdown (docs) | react-markdown |
| Export | jsPDF (PDF), SheetJS (Excel), CSV |
| Deployment | Vercel + GitHub Actions |

## Struktur Proyek

```folder structure
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/            # shadcn/ui (button, card, chart, sidebar, table, ...)
│   │   ├── dashboard/     # app-sidebar, site-header, section-cards, nav-config
│   │   ├── DataTable.tsx  # tabel sortable/exportable + toggle kolom
│   │   ├── DateFilter.tsx # filter rentang tanggal
│   │   ├── StatCard.tsx   # kartu KPI
│   │   └── ...
│   ├── pages/             # 14 laporan + ReportsExports, AnalyticsInsights, DocsPage, WarehousePlaceholder
│   ├── docs-content/      # markdown dokumentasi per menu + konfigurasi (index.tsx)
│   ├── utils/             # formatters, analytics (mesin insight), exporter
│   ├── types/purchase.ts
│   └── data/purchase-data.json
└── scripts/version.mjs    # versi semver dari pesan commit
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
- Halaman Supplier Quality, Outstanding/Open/Closed PO adalah placeholder (`EmptyState`) — tidak ada angka yang dibuat-buat; penjelasannya ada di menu Documentation.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) menjalankan `npm run lint` dan `npm run build` pada setiap push ke `main`, lalu **auto-deploy produksi ke Vercel** (`database-report-gsu.vercel.app`).

Versi aplikasi ditentukan oleh pesan commit: prefiks `feat:`/`perf:` menaikkan minor, prefiks lain (fix/ci/docs) menaikkan patch — ditampilkan di footer sidebar sebagai `vX.Y.Z`.
