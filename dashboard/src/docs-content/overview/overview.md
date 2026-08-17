# Tentang Aplikasi

**Database Report** adalah dashboard reporting **Purchasing** berbasis web (frontend-only) yang menyajikan 14 halaman analisis pembelian ditambah halaman **Reports & Exports** dan **Analytics & AI Insights**. Seluruh angka diturunkan langsung dari dataset riil — tidak ada data rekaan.

## Sumber Data

- File: `purchase-data.json` — ± **3.010 baris invoice** (line item)
- Hanya transaksi berjenis **invoiced**: `PI`, `PN`, `PURBB`
- **Tidak ada** data penerimaan barang (goods receipt), QC, atau reject — konsekuensinya dijelaskan per halaman pada bagian Catatan
- Field numerik disimpan sebagai string di JSON dan di-parse sebelum dihitung; nilai kosong dianggap `0` dan ditampilkan sebagai `-`

## Kategori Item

Field `itemCategory` memiliki tepat 5 nilai:

| Nilai | Keterangan |
|---|---|
| `BAHAN BAKU` | Bahan mentah produksi |
| `BAHAN PENDUKUNG` | Bahan penunjang produksi |
| `SPAREPART` | Suku cadang |
| `WORK IN PROGRESS` | Barang dalam proses |
| `BARANG DAGANG` | Barang dagangan |

## Fitur Global (Berlaku di Semua Halaman)

### Date Filter
Filter rentang tanggal yang menggerakkan **semua** widget, tabel, dan chart di halaman tersebut. Filter mengikuti tanggal `purchaseDate` (beberapa halaman menggunakan `poDate`/`prDate` sesuai metriknya).

### DataTable
Tabel data dengan kemampuan:

- **Search** — cari kata kunci pada semua kolom
- **Sortable header** — klik judul kolom untuk mengurutkan naik/turun
- **Paginasi** — "Halaman X dari Y" dengan navigasi halaman
- **Export** — CSV, Excel, dan PDF untuk data yang sedang tampil
- **Kolom toggle** — pilih kolom yang ditampilkan, dikelompokkan per kategori

### Dark Mode
Toggle tema terang/gelap yang tersimpan di `localStorage` (key: `theme`), berlaku di seluruh aplikasi termasuk halaman ini.