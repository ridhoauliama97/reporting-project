# Fill Rate

## Deskripsi
Laporan tingkat pemenuhan transfer per gudang tujuan: **fill rate = qty diterima ÷ qty dikirim × 100%**, dihitung dari data transfer antar gudang.

## Kegunaan
Mengukur kelengkapan pengiriman antar gudang — fill rate rendah menandakan banyak barang yang dikirim tapi tidak sampai/diterima penuh.

## Data yang Diproses
- `transfer`: `destinationWarehouse*`, `quantity`, `receivedQuantity`, `received`
- Fill rate per gudang = total `receivedQuantity` ÷ total `quantity`

## Catatan
- Fill rate dihitung dari **transfer antar gudang**, bukan dari PO pembelian ke supplier.
- Filter tanggal berlaku pada tanggal transfer (`transferDate`).