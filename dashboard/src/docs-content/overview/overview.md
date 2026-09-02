# Tentang Aplikasi

**Database Report** adalah dashboard reporting **Purchasing & Warehouse** berbasis web (frontend-only) yang menyajikan 14 halaman analisis pembelian, 17 laporan menu Warehouse (real + placeholder), halaman **Reports & Exports**, **Analytics & AI Insights**, dan 3 halaman placeholder warehouse. Seluruh angka diturunkan langsung dari dataset riil — tidak ada data rekaan.

## Sumber Data

- Dua file dimuat runtime dari `dashboard/src/data/`:
  - `purchasing-data.json` — **9.418 record**, 3 tipe: invoice pembelian (3.284), PO (3.220), PR (2.914)
  - `warehouse-data.json` — **78.472 record**, 7 tipe: saldo stok (2.886), transfer antar gudang (7.879), adjustment (856), pemakaian (7.001), produksi (45.046), material terpakai produksi (13.127), output produksi (1.677)
- Rentang data: Januari–Agustus 2026 (adjustment s.d. Juli 2026); saldo stok (`stock`) merupakan **snapshot** per 31 Agustus 2026
- **Tidak ada** data penerimaan barang (goods receipt), QC, reject, cyce count, picking, maupun packing — konsekuensinya dijelaskan per halaman pada bagian Catatan
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
