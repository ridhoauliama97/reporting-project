# Material Cost Trend (Tren Biaya Material)

## Deskripsi
Tren biaya pembelian material dari waktu ke waktu (per bulan) — untuk memantau perkembangan biaya bahan baku dan bahan pendukung.

## Scope
Hanya kategori `BAHAN BAKU` dan `BAHAN PENDUKUNG` — terdapat **toggle kategori** untuk memilih salah satu atau keduanya.

## Fitur
- **4 kartu statistik**: Total Biaya Material, Rata-rata Biaya per Bulan, Bulan dengan Biaya Tertinggi, Trend vs Bulan Lalu (%)
- **Chart**: line/area — total `netTotal` per bulan (dari `purchaseDate`), satu garis per kategori
- **Tabel**: Bulan, Bahan Baku (Rp), Bahan Pendukung (Rp), Total (Rp)

## Data yang Diproses
Baris invoice kategori `BAHAN BAKU`/`BAHAN PENDUKUNG` dalam rentang tanggal aktif, diagregasi per bulan.

## Catatan
Kategori lain (`SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`) tidak termasuk scope laporan ini.