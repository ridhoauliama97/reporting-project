# Closed PO

## Deskripsi
Daftar PO yang **seluruh item-nya sudah diterima penuh** (qty diterima >= qty pesan) — proses pengiriman sudah tuntas.

## Kegunaan
- Rekam historis PO yang sudah beres
- Dasar audit atau verifikasi bahwa suatu proses pembelian sudah closed dengan benar

## Formula
```
Closed : qty diterima >= qty pesan (diterima penuh)
```

## Sumber Data
Dataset `purchase-order-by-item` — dihitung dari `Qty. Ordered (Major)` vs `Qty. Delivered (Major)` per baris item, lalu dikelompokkan per nomor PO. Filter tanggal berlaku pada **tanggal PO**.

## Statistik & Visualisasi
- 4 kartu KPI: jumlah PO, jumlah baris item, total nilai PO, qty belum diterima (0 untuk PO closed)
- Grafik batang nilai PO per supplier (10 terbesar)
- Tabel detail: nomor PO, tanggal, supplier, target gudang, jumlah item, % diterima, nilai PO, expected delivery, nomor PR

## Batasan
Field `Closed By`/`Closed Reason` di dataset kosong — status "closed" disimpulkan dari kesesuaian qty diterima vs dipesan, bukan dari status sistem.