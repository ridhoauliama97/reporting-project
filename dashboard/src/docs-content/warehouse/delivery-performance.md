# Delivery Performance (Kinerja Pengiriman)

## Deskripsi
Laporan kinerja pengiriman **transfer antar gudang**: rata-rata lama pengiriman per gudang tujuan dan per bulan, dihitung dari selisih tanggal transfer (`transferDate`) dan tanggal diterima (`receivedDate`).

## Kegunaan
Memantau kelancaran distribusi barang antar gudang — gudang dengan rata-rata hari kirim tinggi perlu dievaluasi prosesnya.

## Data yang Diproses
- `transfer`: `transferDate`, `receivedDate`, `received`, `destinationWarehouse*`
- Lama pengiriman = `receivedDate − transferDate` (hari) untuk status `Received`
- Transfer berstatus `Pending` dihitung sebagai pending, tidak termasuk rata-rata

## Catatan
- Ini adalah proksi kinerja pengiriman internal (transfer antar gudang), **bukan** kinerja kiriman supplier.
- Filter tanggal berlaku pada tanggal transfer (`transferDate`).