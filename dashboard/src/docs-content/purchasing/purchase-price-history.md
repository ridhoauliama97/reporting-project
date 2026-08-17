# Purchase Price History (Riwayat Harga)

## Deskripsi
Riwayat harga satuan (`unitCost`) sebuah item dari waktu ke waktu — untuk melihat pergerakan harga dan dasar negosiasi.

## Fitur
- **Wajib pilih item** (`itemName` dropdown) di samping date filter — jika belum memilih, halaman menampilkan prompt: *"Pilih item untuk melihat riwayat harga"*
- **4 kartu statistik** (untuk item terpilih): Harga Terakhir, Harga Terendah, Harga Tertinggi, Rata-rata Harga
- **Chart**: line chart `unitCost` terhadap `purchaseDate` untuk item terpilih
- **Tabel**: Tanggal Purchase, Nomor Purchase, Nama Supplier, Kuantitas, Harga Satuan, Total Netto — sort by tanggal descending

## Data yang Diproses
Baris invoice item terpilih dalam rentang tanggal aktif.

## Catatan
Harga yang dibandingkan adalah `unitCost` per baris invoice — fluktuasi kecil bisa muncul karena perbedaan lot/pengadaan.