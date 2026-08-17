# Supplier Delivery Performance (Ketepatan Pengiriman Supplier)

## Deskripsi
Metrik ketepatan pengiriman per supplier — seberapa cepat sebuah PO sampai ke tahap invoice, dan berapa banyak transaksi yang terlambat.

## Fitur
- **4 kartu statistik**: Rata-rata Hari PO→Invoice, Jumlah Transaksi Terlambat (`poPiOverdueDays > 0`), % Tepat Waktu, Supplier Paling Lambat
- **Tabel grouped by `supplierName`**: Nama Supplier, Rata-rata Hari PO→Invoice, Rata-rata Hari Overdue, Jumlah Transaksi Terlambat, Jumlah Transaksi Total — sort by Rata-rata Hari Overdue descending

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif menggunakan `poPiDays` (jarak PO → Invoice) dan `poPiOverdueDays` (hari keterlambatan).

## Catatan Penting: Proxy Metric
Ini adalah **proxy metric** — dihitung dari `poPiDays`/`poPiOverdueDays` (jarak PO → Invoice), **bukan** data goods-receipt aktual, karena dataset memang tidak punya data penerimaan barang. Halaman menampilkan `InfoBanner` yang menjelaskan keterbatasan ini.