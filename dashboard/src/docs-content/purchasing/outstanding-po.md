# Outstanding PO

## Deskripsi
Daftar Purchase Order yang barangnya **sudah diterima sebagian namun masih memiliki sisa kuantitas yang belum diterima** (0 < qty diterima < qty pesan).

## Kegunaan
- Follow-up ke supplier untuk sisa kiriman yang belum tuntas
- Acuan komitmen pembelian yang masih outstanding (belum terealisasi penuh)

## Formula
```
Outstanding Qty = Qty Dipesan - Qty Diterima
```
Status PO (diturunkan dari kesesuaian qty, bukan field tersimpan):
- **CLOSED**: qty diterima ≥ qty pesan (diterima penuh)
- **OUTSTANDING**: 0 < qty diterima < qty pesan (diterima sebagian)
- **OPEN**: qty diterima = 0 (belum menerima pengiriman)

## Sumber Data
Dataset `purchasing-data.json` (recordType `po`) — dihitung dari Qty. Ordered vs Qty. Delivered per baris item, lalu **dikelompokkan per nomor PO** (tabel menampilkan satu baris per PO: jumlah item, qty agregat, % diterima, nilai PO). Filter tanggal berlaku pada tanggal PO.

## Statistik & Visualisasi
- 4 kartu KPI: jumlah PO, jumlah baris item, total nilai PO, qty belum diterima
- Grafik batang nilai PO per supplier (10 terbesar)
- Tabel detail: nomor PO, tanggal, supplier, target gudang, jumlah item, qty belum diterima, % diterima, nilai PO, expected delivery, nomor PR

## Batasan
Status "closed" di dataset tidak eksplisit — disimpulkan dari kesesuaian qty diterima vs dipesan. Baris dengan qty diterima nol tidak ditampilkan di laporan ini (masuk kategori OPEN).