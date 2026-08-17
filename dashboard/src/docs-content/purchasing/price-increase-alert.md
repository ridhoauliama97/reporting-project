# Price Increase Alert (Alert Kenaikan Harga)

## Deskripsi
Mendeteksi item yang harganya **naik secara sekuensial** antar pembelian — dengan threshold yang bisa diatur, sehingga kenaikan yang signifikan ter-highlight sebagai alert.

## Cara Kerja
Per `itemName`, pembelian diurutkan berdasarkan `purchaseDate`; `unitCost` setiap pembelian dibandingkan dengan pembelian sebelumnya untuk item yang sama. Baris **di-flag** jika kenaikannya ≥ threshold.

## Threshold (Bisa Diatur)
- Default: **10%**
- Dapat diubah lewat form input di halaman
- Kenaikan di bawah threshold dianggap **normal, tidak di-highlight**
- Baris yang lolos threshold di-highlight berdasarkan **tingkat severity**

## Fitur
- **4 kartu statistik**: Jumlah Item Naik Harga, Rata-rata Kenaikan (%), Kenaikan Tertinggi (item + %), Item Terpantau (item unik dengan ≥2 titik harga)
- **Tabel** (hanya item ter-flag): Nama Item, Nama Supplier, Tanggal Sebelumnya, Harga Sebelumnya, Tanggal Terbaru, Harga Terbaru, Kenaikan (%) — baris di-highlight sesuai severity

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif, dikelompokkan per `itemName` dan diurutkan per tanggal.

## Catatan
Threshold 10% adalah nilai awal yang disarankan — sesuaikan dengan kebijakan pengadaan tim Anda. Lihat [Istilah & Definisi](../overview/glossary) untuk penjelasan *threshold*.