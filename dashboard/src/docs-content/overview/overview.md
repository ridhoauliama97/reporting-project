# Tentang Aplikasi

**Database Report** adalah dashboard reporting **Purchasing & Warehouse** berbasis web (frontend-only) yang menyajikan 14 halaman analisis pembelian, 12 laporan warehouse, halaman **Reports & Exports**, **Analytics & AI Insights**, dan 5 halaman placeholder warehouse. Seluruh angka diturunkan langsung dari dataset riil — tidak ada data rekaan.

## Sumber Data

- File: `purchase-data.json` (dimuat runtime dari `dashboard/src/data/`) — dataset gabungan ± **25.917 record** dari 7 tipe: invoice pembelian (3.010), PO (2.996), PR (2.650), saldo stok (2.861), transfer antar gudang (7.174), adjustment (706), dan pemakaian (6.520)
- Rentang data: Januari–Agustus 2026; saldo stok (`stock`) merupakan **snapshot** per 14 Agustus 2026
- **Tidak ada** data penerimaan barang (goods receipt), QC, atau reject — konsekuensinya dijelaskan per halaman pada bagian Catatan
- Field numerik disimpan sebagai string di JSON dan di-parse sebelum dihitung; nilai kosong dianggap `0` dan ditampilkan sebagai `-`

## Kategori Item

Field `itemCategory` memiliki tepat 5 nilai:

| Nilai | Keterangan |
| --- | --- |
| `BAHAN BAKU` | Bahan mentah produksi |
| `BAHAN PENDUKUNG` | Bahan penunjang produksi |
| `SPAREPART` | Suku cadang |
| `WORK IN PROGRESS` | Barang dalam proses |
| `BARANG DAGANG` | Barang dagangan |

## Fitur Global (Berlaku di Semua Halaman)

### Date Filter

Filter rentang tanggal yang menggerakkan **semua** widget, tabel, dan chart di halaman tersebut. Filter mengikuti tanggal `purchaseDate` (beberapa halaman menggunakan `poDate`/`prDate` sesuai metriknya); halaman warehouse mengikuti `transferDate`/`adjustmentDate`/`usageDate` sesuai sumbernya. Laporan berbasis snapshot stok (Inventory Value, Dead/Slow/Fast Moving, Inventory Aging, Location Occupancy, Stock Availability) tidak terpengaruh filter — informasinya ditampilkan pada InfoBanner di halaman masing-masing.

### DataTable

Tabel data dengan kemampuan:

- **Search** — cari kata kunci pada semua kolom
- **Sortable header** — klik judul kolom untuk mengurutkan naik/turun
- **Paginasi** — "Halaman X dari Y" dengan navigasi halaman
- **Export** — CSV, Excel, dan PDF untuk data yang sedang tampil
- **Kolom toggle** — pilih kolom yang ditampilkan, dikelompokkan per kategori

### Dark Mode

Toggle tema terang/gelap yang tersimpan di `localStorage` (key: `theme`), berlaku di seluruh aplikasi termasuk halaman ini.
