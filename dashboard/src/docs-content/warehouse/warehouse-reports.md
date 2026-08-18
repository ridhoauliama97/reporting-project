# Laporan Gudang (Stok & Aktivitas)

## Deskripsi
Setiap halaman gudang menampilkan kondisi stok dan aktivitas untuk satu gudang: saldo stok, pemakaian barang, transfer antar gudang, dan penyesuaian stok.

## Fitur (per gudang)
- **4 kartu KPI**: Jumlah item stok, total on hand, nilai stok (on hand × harga beli terakhir), pemakaian (total cost dalam rentang tanggal)
- **Chart**: saldo stok per kategori item
- **Tabel 1 — Saldo Stok**: kode item, nama item, kategori, satuan, on hand, harga beli terakhir, nilai stok — diurutkan on hand terbesar
- **Tabel 2 — Pemakaian Barang**: tanggal, no. usage, item, kategori, qty, total cost, pemohon
- **Tabel 3 — Transfer Antar Gudang**: tanggal, no. memo, tipe transfer, gudang asal → tujuan, item, qty, status received
- **Tabel 4 — Penyesuaian Stok**: tanggal, no. memo, tipe, item, qty (DB/CR), nilai penyesuaian

## Sumber Data
Digabung dari 4 dataset: `stock-balance` (saldo), `usage-by-item` (pemakaian), `goods-transfer-by-tem` (transfer), `adjustment-by-item` (penyesuaian) — disaring berdasarkan kode gudang (mis. `07` untuk GUDANG SPAREPART).

## Catatan
- Saldo stok adalah **snapshot** (tidak ikut filter tanggal); tabel pemakaian/transfer/penyesuaian mengikuti rentang tanggal aktif.
- Kode gudang di dataset: 01, 02, 04, 05, 07, 08, 09, 10, 13, 14, 22, 24, 25, 40, 41, 42, 44, 45, 50, 51, 54, dan TRANSIT.
- Kategori `BARANG DAGANG` pada transfer mencatat perpindahan dagang (contoh: GUDANG OL PB sebagai pusat distribusi).