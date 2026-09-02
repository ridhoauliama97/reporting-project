# Warehouse Utilization (Utilisasi Lokasi Gudang)

## Deskripsi
Laporan pemanfaatan lokasi/rak penyimpanan per gudang — seberapa banyak shelf location yang berisi stok dibanding seluruh shelf location yang terdaftar pada snapshot stok.

## Kegunaan
Mendeteksi gudang dengan lokasi yang paling banyak terisi (risiko penuhnya ruang) dan barang yang belum ditetapkan lokasinya ("Tanpa Lokasi") untuk optimasi penempatan.

## Definisi Metrik
- **Lokasi Terdaftar** — jumlah shelf code unik yang muncul pada baris stok dengan `onHand > 0`
- **Lokasi Terisi** — shelf code yang berisi stok (subset dari lokasi terdaftar)
- **Utilisasi** — `lokasi terisi ÷ lokasi terdaftar × 100` per gudang
- **Item Tanpa Lokasi** — baris stok tanpa shelf code

## Status Saat Ini: Real Data (proxy)
Dataset `warehouse-data.json` berisi `stock` (snapshot) sehingga laporan dapat menampilkan angka riil. Utilisasi dihitung dari ketersediaan shelf code — **bukan** kapasitas fisik rak, karena data kapasitas maksimum tidak tersedia di sumber.