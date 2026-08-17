# Purchase Summary (Ringkasan Pembelian)

## Deskripsi
Tabel ringkasan **seluruh transaksi pembelian** pada rentang tanggal yang dipilih — satu baris per line item invoice. Halaman utama dashboard yang menjadi titik masuk seluruh laporan.

## Fitur
- **Full line-item table** — menampilkan setiap baris invoice dengan detail lengkap
- **"Kolom" column picker (grouped)** — pilih kolom yang ditampilkan, dikelompokkan per kategori
- **Baris total otomatis** — agregasi nilai di akhir tabel sesuai filter aktif

## Kolom Default
`purchaseNumber`, `purchaseDate`, `supplierName`, `itemName`, `warehouse`, `quantity`, `uom`, `netTotal`

## Data yang Diproses
Seluruh baris invoice (`PI`/`PN`/`PURBB`) sesuai filter tanggal aktif.

## Catatan
Nilai numerik yang kosong pada data sumber dirender sebagai `-`, bukan 0.