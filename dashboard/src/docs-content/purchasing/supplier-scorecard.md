# Supplier Scorecard (Peringkat & Scorecard Supplier)

## Deskripsi
Skor komposit per supplier dari dua dimensi yang tersedia — **Harga** dan **Ketepatan Waktu** — untuk membandingkan performa supplier secara terukur.

## Formula
```
Score Total = rata-rata(Skor Harga, Skor Ketepatan Waktu)
```
Kedua skor berskala **0-100**.

### Skor Harga
Berdasarkan frekuensi/severity kenaikan harga ≥ 10% (menggunakan logic **Price Increase Alert** #9) — semakin sedikit/kecil kenaikan, semakin tinggi skor.

### Skor Ketepatan Waktu
Persentase transaksi dengan `poPiOverdueDays <= 0`.

## Rating Badge
| Rating | Rentang Skor |
|---|---|
| **Excellent** | ≥ 80 |
| **Good** | 60 - 79 |
| **Perlu Perhatian** | < 60 |

## Fitur
- **4 kartu statistik**: Supplier Skor Tertinggi, Supplier Skor Terendah, Rata-rata Skor Total, Jumlah Supplier Dinilai
- **Tabel**: Nama Supplier, Skor Harga, Skor Ketepatan Waktu, Skor Total, Rating badge — sort by Skor Total descending

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif, diagregasi per `supplierName`.

## Catatan
Skor berbasis **Harga & Ketepatan Waktu** saja — dimensi **Kualitas belum tersedia** (lihat #4 Supplier Quality). Halaman menampilkan catatan ini sebagai subtitle.