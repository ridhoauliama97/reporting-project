# Supplier Lead Time (Lead Time Pembelian)

## Deskripsi
Distribusi lama waktu proses pembelian — dari permintaan hingga invoice — disajikan sebagai histogram.

## Fitur
- **4 kartu statistik**: Rata-rata Lead Time PR→Invoice (avg `prPiDays`), Rata-rata Lead Time PO→Invoice (avg `poPiDays`), Lead Time Tercepat, Lead Time Terlama
- **Chart**: histogram `poPiDays` dengan bucket:
  - `0-3 hari`
  - `4-7 hari`
  - `8-14 hari`
  - `15+ hari`
- **Tabel**: Nomor PR, Tanggal PR, Nomor PO, Tanggal PO, Nomor Purchase, Tanggal Purchase, Lead Time PR→Invoice (hari), Lead Time PO→Invoice (hari) — sort by Lead Time PO→Invoice descending

## Data yang Diproses
Baris invoice dengan `prPiDays`/`poPiDays` terisi, dalam rentang tanggal aktif.

## Catatan
Hanya `prPiDays` dan `poPiDays` yang tersedia di dataset — **jangan** membuat metrik PR→PO terpisah karena data tersebut tidak ada.