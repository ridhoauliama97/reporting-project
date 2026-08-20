# Location Occupancy (Pengisian Lokasi)

## Deskripsi
Laporan pengisian lokasi/rak penyimpanan per gudang berdasarkan `shelfCode` pada data stok: jumlah item, on-hand, dan nilai per lokasi.

## Kegunaan
Memantau sebaran barang per lokasi, menemukan lokasi terpadat, dan memastikan barang tersimpan di lokasi yang benar.

## Data yang Diproses
- `stock`: `shelfCode`, `warehouseCode`, `warehouseName`, `onHand`, `lastPurchaseCost`
- Item tanpa `shelfCode` dikelompokkan sebagai "Tanpa Lokasi"

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Hanya sebagian baris stok yang memiliki `shelfCode` (sisanya "Tanpa Lokasi").