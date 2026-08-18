# Open PO

## Deskripsi
Daftar PO yang **statusnya masih aktif/berjalan dan belum menerima pengiriman sama sekali** (qty diterima = 0).

## Kegunaan
Monitoring komitmen pembelian yang masih berjalan — berapa banyak PO aktif dan total nilainya, agar tim bisa memproyeksikan cash flow/kebutuhan gudang ke depan.

## Formula
```
Open  : qty diterima = 0 (belum ada pengiriman)
Outstanding : 0 < qty diterima < qty pesan
Closed : qty diterima >= qty pesan
```

## Sumber Data
Dataset `purchase-order-by-item` — dihitung dari `Qty. Delivered (Major)` per baris item, lalu dikelompokkan per nomor PO. Filter tanggal berlaku pada **tanggal PO**.

## Statistik & Visualisasi
- 4 kartu KPI: jumlah PO, jumlah baris item, total nilai PO, qty belum diterima
- Grafik batang nilai PO per supplier (10 terbesar)
- Tabel detail: nomor PO, tanggal, supplier, target gudang, jumlah item, qty belum diterima, % diterima, nilai PO, expected delivery, nomor PR

## Batasan
Periode ini tercatat 34 Open PO (belum menerima pengiriman sama sekali). PO dengan status "Active" di dataset tidak selalu berarti belum diterima — penilaian status berdasarkan qty penerimaan aktual.