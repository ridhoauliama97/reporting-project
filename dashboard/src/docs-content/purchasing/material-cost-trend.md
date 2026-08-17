# Material Cost Trend (Tren Biaya Material)

## Deskripsi
Tren biaya pembelian dari waktu ke waktu (per bulan) — untuk memantau perkembangan biaya per kategori item.

## Scope
Seluruh **5 kategori** item tersedia di filter: `BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG` — **semua dicentang secara default**. Chart dan tabel mengikuti kategori yang dicentang.

## Fitur
- **Filter Kategori (checkbox 5 kategori)** — centang/hilangkan centang untuk memilih kategori yang ditampilkan
- **4 kartu statistik**: Total Biaya Pembelian, Rata-rata Biaya per Bulan, Bulan dengan Biaya Tertinggi, Trend vs Bulan Lalu (%)
- **Chart**: line/area — total `netTotal` per bulan (dari `purchaseDate`), satu garis per kategori terpilih
- **Tabel**: Bulan, kolom per kategori terpilih (Rp), Total (Rp)

## Data yang Diproses
Baris invoice dalam rentang tanggal aktif dari kategori yang dicentang, diagregasi per bulan.

## Catatan
Jika semua kategori di-uncheck, grafik menampilkan pesan untuk memilih minimal satu kategori.