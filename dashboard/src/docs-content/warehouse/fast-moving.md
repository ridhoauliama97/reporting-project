# Fast Moving

## Deskripsi
Laporan item dengan perputaran cepat: stok tersedia (`on-hand > 0`) dan pemakaian terakhir **kurang dari 30 hari** (`daysSinceLastUsage < 30`).

## Kegunaan
Mengidentifikasi barang yang paling sering terpakai — penting untuk menjaga level minimum stok, mengatur buffer safety stock, dan memprioritaskan penempatan di lokasi strategis gudang.

## Data yang Diproses
- `stock`: `onHand`, `daysSinceLastUsage`, `lastUsageDate`, `lastPurchaseCost`, `lastPurchaseQuantity`
- Kriteria: `onHand > 0` dan `daysSinceLastUsage < 30`

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Pengurutan default: pemakaian paling baru di atas.