# Purchase by Supplier (Pembelian per Supplier)

## Deskripsi
Ringkasan pembelian yang **dikelompokkan per supplier** — untuk melihat porsi nilai dan aktivitas masing-masing supplier dalam periode terpilih.

## Fitur
- **4 kartu statistik**: Total Pembelian (sum `netTotal`), Jumlah Supplier Aktif (distinct `supplierName`), Rata-rata Pembelian per Supplier, Supplier Terbesar (nama + nilai tertinggi)
- **Tabel grouped by `supplierName`**: Nama Supplier, Jumlah Transaksi, Total Kuantitas, Total Pembelian (Rp), % dari Grand Total — diurutkan Total Pembelian descending

## Data yang Diproses
Seluruh baris invoice dalam rentang tanggal aktif, diagregasi per `supplierName`.

## Catatan
Persentase kontribusi dihitung terhadap grand total periode terpilih — pastikan rentang tanggal sesuai sebelum membaca proporsi supplier.