# Slow Moving

## Deskripsi
Laporan item dengan perputaran lambat: stok tersedia (`on-hand > 0`) dan pemakaian terakhir **90–179 hari** lalu (`90 ≤ daysSinceLastUsage ≤ 179`).

## Kegunaan
Menangkap item yang mulai jarang dipakai sebelum masuk kategori dead stock, sehingga bisa diambil tindakan lebih awal (transfer ke gudang yang membutuhkan, promosi, atau pengurangan pemesanan).

## Data yang Diproses
- `stock`: `onHand`, `daysSinceLastUsage`, `lastUsageDate`, `age`, `lastPurchaseCost`
- Kriteria: `onHand > 0` dan `90 ≤ daysSinceLastUsage ≤ 179`

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Item dengan `daysSinceLastUsage ≥ 180` masuk laporan Dead Stock.