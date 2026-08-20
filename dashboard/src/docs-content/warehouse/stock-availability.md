# Stock Availability (Ketersediaan Stok)

## Deskripsi
Laporan ketersediaan stok per item: on-hand, qty diblokir, qty dalam transit, outstanding PO/SO, stok tersedia (`on-hand − diblokir`), dan perbandingan dengan minimum order.

## Kegunaan
Menjawab "berapa barang yang benar-benar bisa dipakai/dijual sekarang" dan mendeteksi item yang berada di bawah minimum order (shortage) sehingga perlu segera dipesan.

## Data yang Diproses
- `stock`: `onHand`, `qtyBlocked`, `qtyInTransit`, `outstandingPO`, `outstandingSO`, `qtyMinimumOrder`
- Tersedia = `onHand − qtyBlocked`; Kekurangan = `max(0, qtyMinimumOrder − tersedia)`

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Baris dengan kekurangan > 0 ditandai merah di kolom Kekurangan.