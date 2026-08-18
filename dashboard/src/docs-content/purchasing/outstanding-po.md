# Outstanding PO

## Deskripsi
Daftar Purchase Order yang **barangnya sudah diterima sebagian namun masih memiliki sisa kuantitas** yang belum diterima (0 < qty diterima < qty pesan).

## Kegunaan
- Follow-up ke supplier untuk sisa kiriman yang belum tuntas
- Acuan komitmen pembelian yang masih outstanding (belum terealisasi penuh)

## Formula
```
Outstanding Qty = Qty Dipesan (Major) - Qty Diterima (Major)
Status PO:
- CLOSED      : qty diterima >= qty pesan (diterima penuh)
- OUTSTANDING : 0 < qty diterima < qty pesan (diterima sebagian)
- OPEN        : qty diterima = 0 (belum menerima pengiriman)
```

## Sumber Data
Dataset `purchase-order-by-item` — dihitung dari `Qty. Ordered (Major)` vs `Qty. Delivered (Major)` per baris item, lalu dikelompokkan per nomor PO. Filter tanggal berlaku pada **tanggal PO**.

## Statistik & Visualisasi
- 4 kartu KPI: jumlah PO, jumlah baris item, total nilai PO, qty belum diterima
- Grafik batang nilai PO per supplier (10 terbesar)
- Tabel detail: nomor PO, tanggal, supplier, target gudang, jumlah item, qty belum diterima, % diterima, nilai PO, expected delivery, nomor PR

## Batasan
Periode ini tercatat 1 PO berstatus outstanding (penerimaan sebagian). Status "closed" di dataset tidak eksplisit — disimpulkan dari kesesuaian qty diterima vs dipesan.