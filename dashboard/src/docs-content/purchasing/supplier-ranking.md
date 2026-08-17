# Supplier Ranking (Peringkat Supplier)

## Deskripsi
Peringkat supplier berdasarkan total nilai pembelian — menjawab pertanyaan "siapa supplier terbesar kami dalam periode ini".

## Fitur
- **4 kartu statistik**: Top 1 Supplier, Top 5 Suppliers gabungan (sum + %), Jumlah Supplier dalam periode, Rata-rata nilai per supplier
- **Chart**: horizontal bar — **Top 10 suppliers** by sum `netTotal`, descending
- **Tabel**: Rank, Nama Supplier, Total Pembelian (Rp), Jumlah Transaksi, % Kontribusi — sortable, default sort Total Pembelian descending

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif, diagregasi per `supplierName` berdasarkan `netTotal`.

## Catatan
Chart hanya menampilkan 10 besar; daftar lengkap tersedia di tabel dengan paginasi.