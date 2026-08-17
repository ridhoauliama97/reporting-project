# Purchase Variance (Varians Kuantitas)

## Deskripsi
Selisih antara kuantitas yang di-invoice dengan kuantitas yang di-order per transaksi — untuk mendeteksi kelebihan/kekurangan kirim dari supplier.

## Formula
```
variance = quantity - qtyOrdered
```

Hanya dihitung pada baris dengan `qtyOrdered > 0`. Tabel hanya menampilkan baris dengan `variance ≠ 0`.

## Fitur
- **4 kartu statistik**: Jumlah Baris dengan Variance, Total Selisih Kuantitas, Item dengan Variance Terbesar, % Baris Bervariance dari Total
- **Tabel** (hanya baris `variance ≠ 0`): Tanggal Purchase, Nomor Purchase, Nama Item, Nama Supplier, Qty Ordered, Qty Invoiced, Selisih — **merah** jika kekurangan kirim (short), **hijau** jika kelebihan kirim (over)

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif dengan `qtyOrdered` terisi.

## Catatan
Variance negatif (kekurangan) umumnya lebih perlu di-follow-up daripada kelebihan — gunakan kolom Selisih yang diberi warna.