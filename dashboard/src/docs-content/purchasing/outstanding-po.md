# Outstanding PO

## Deskripsi
Daftar baris Purchase Order yang masih memiliki **sisa kuantitas belum diterima** (`Qty Outstanding > 0`) — sisa kewajiban pengiriman dari supplier.

## Kegunaan
- Follow-up ke supplier untuk barang yang belum datang
- Acuan komitmen pembelian yang masih outstanding (belum terealisasi penuh)

## Formula
```
Qty Outstanding = Qty Dipesan - Qty Diterima
```
Baris ditampilkan jika hasilnya > 0. Nilai outstanding dihitung dari `Qty Outstanding × Harga Satuan PO` (karena sumber data tidak menyimpan nilai per baris yang belum diterima).

## Sumber Data
File PO (`purchase-order-by-item`) — **bukan** dari dataset invoice. Dataset PO tidak menyimpan status `open`/`closed`, sehingga status diturunkan dari sisa kuantitas: PO dianggap outstanding selama masih ada sisa belum diterima.

## Filter
- Filter tanggal (sidebar atas) berlaku pada **Tanggal PO** (`orderDate`).
- Filter "Qty Outstanding" menampilkan seluruh baris, diurutkan dari sisa terbesar.

## Catatan
Terdapat 50 baris PO dengan sisa kuantitas (35 nomor PO). Kolom `% Diterima` disimpan sebagai fraksi (1.0000 = 100%) di sumber data — ditampilkan sebagai persen di laporan ini.