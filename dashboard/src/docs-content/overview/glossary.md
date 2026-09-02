# Istilah & Definisi

Glosarium istilah teknis yang dipakai di seluruh dokumentasi dan aplikasi.

## Threshold

**Ambang batas** — nilai batas yang harus dilewati sebelum suatu kondisi dianggap signifikan. Contoh: di **Price Increase Alert**, kenaikan `unitCost` per item baru di-highlight sebagai alert jika kenaikannya ≥ threshold (default **10%**). Kenaikan di bawah threshold dianggap normal.

## Proxy Metric

**Metrik pengganti** — metrik yang dihitung dari data pengganti karena data yang "seharusnya" dipakai tidak tersedia. Contoh: **Supplier Delivery** mengukur ketepatan pengiriman dari jarak PO → Invoice (`poPiDays`), bukan dari data penerimaan barang aktual yang memang tidak ada di dataset. Proxy metric selalu ditandai dengan catatan `InfoBanner` di halamannya.

## Placeholder Page

**Halaman placeholder** — halaman yang sengaja ditampilkan kosong (`EmptyState`) karena dataset memang tidak memiliki data untuk metrik tersebut (misal data QC/reject atau status PO). Ini **bukan bug** dan **bukan halaman yang belum selesai dibangun** — halaman akan terisi otomatis begitu sumber data tersedia.

## Data Invoiced

Transaksi yang sudah melalui proses invoicing — tipe `PI`, `PN`, `PURBB`. Dataset hanya berisi jenis transaksi ini, sehingga seluruh laporan berbasis pada fakta pembelian yang sudah tercatat sebagai invoice.

## Net Total (`netTotal`)

Total nilai bersih sebuah baris invoice (kuantitas × harga satuan setelah penyesuaian). Menjadi dasar perhitungan nilai pembelian di hampir semua laporan.

## Lead Time

Jarak waktu antara dua titik proses. Dua metrik tersedia di dataset:

- **PR → Invoice** (`prPiDays`) — jarak hari dari permintaan pembelian (PR) hingga invoice
- **PO → Invoice** (`poPiDays`) — jarak hari dari purchase order (PO) hingga invoice

Metrik PR → PO **tidak** dihitung karena datanya tidak tersedia.

## Variance (Selisih Kuantitas)

Selisih antara kuantitas yang di-invoice dan yang di-order: `variance = quantity - qtyOrdered`. Positif berarti kelebihan kirim, negatif berarti kekurangan kirim (dihitung hanya jika `qtyOrdered > 0`).