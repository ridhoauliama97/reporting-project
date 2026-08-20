# Inventory Aging (Umur Persediaan)

## Deskripsi
Laporan distribusi umur stok dalam kelompok umur: **0–30, 31–60, 61–90, 91–180, dan 180+ hari**, berdasarkan field `age` pada data stok.

## Kegunaan
Memantau penuaan persediaan (aging) — semakin tua stok semakin besar risiko kerusakan, kedaluwarsa, atau menjadi dead stock. Membantu menentukan kebijakan FIFO dan write-off.

## Data yang Diproses
- `stock`: `age`, `onHand`, `lastPurchaseCost`
- Nilai = `onHand × lastPurchaseCost` per kelompok umur

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- `age` pada data sumber adalah umur stok dalam hari (bukan perhitungan ulang dari tanggal).