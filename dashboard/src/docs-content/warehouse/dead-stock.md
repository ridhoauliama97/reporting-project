# Dead Stock

## Deskripsi
Laporan item yang stoknya tersedia (`on-hand > 0`) tetapi **tidak terpakai selama ≥ 180 hari** sejak pemakaian terakhir (`daysSinceLastUsage ≥ 180`).

## Kegunaan
Mengidentifikasi barang yang berisiko rusak/kedaluwarsa dan mengikat modal tanpa perputaran — dasar keputusan promosi, transfer antar gudang, atau penghapusan (write-off).

## Data yang Diproses
- `stock`: `onHand`, `daysSinceLastUsage`, `lastUsageDate`, `age`, `lastPurchaseCost`
- Nilai = `onHand × lastPurchaseCost`
- Kriteria: `onHand > 0` dan `daysSinceLastUsage ≥ 180`

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Ambang batas 180 hari dapat disesuaikan sesuai kebijakan perusahaan.