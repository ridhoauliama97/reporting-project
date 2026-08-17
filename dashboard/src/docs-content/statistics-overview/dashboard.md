# Dashboard (Landing Page)

## Deskripsi
Halaman utama aplikasi — menu terpisah di paling atas sidebar yang merangkum statistik **keseluruhan** laporan purchasing dan insight utama sesuai rentang tanggal aktif.

## Fitur
- **Sapaan dinamis** — judul halaman menyesuaikan waktu (Selamat pagi/siang/sore/malam) beserta subjudul pembuka yang ramah pengguna
- **4 kartu statistik utama** — Total Nilai Pembelian, Jumlah Transaksi, Supplier Aktif, dan Rata-rata Nilai per Transaksi, lengkap dengan tren (badge naik/turun) dibandingkan periode sebelumnya
- **Ringkasan AI Keseluruhan** — satu ringkasan otomatis yang menggabungkan total pembelian, kategori terbesar, supplier terbesar, tingkat keterlambatan, lead time rata-rata, kenaikan harga, selisih qty, dan anomali (diperbarui mengikuti filter tanggal; bukan per laporan). Seluruh nilai ditampilkan dalam format rupiah penuh
- **Mini preview 6 laporan** — snapshot singkat (maksimal 5 baris data) yang memengaruhi keputusan, judul dan deskripsi mengikuti laporan aslinya, masing-masing dengan tautan menuju laporan penuh:
  - Purchase Summary (distribusi nilai per kategori)
  - Supplier Ranking (top supplier berdasarkan nilai pembelian)
  - Supplier Delivery Performance (supplier dengan keterlambatan PO → Invoice terbanyak)
  - Supplier Lead Time (rata-rata lead time PO → Invoice terlama)
  - Price Increase Alert (kenaikan harga berurutan ≥ 10%)
  - Purchase Variance (selisih qty terhadap qty pesanan)

## Data yang Diproses
Seluruh baris invoice (`PI`/`PN`/`PURBB`) sesuai filter tanggal aktif, dengan rentang periode sebelumnya untuk perhitungan tren.

## Catatan
- Halaman ini menggantikan Purchase Summary sebagai landing page (`/dashboard`); Purchase Summary kini hanya berisi tabel line-item penuh.
- Ringkasan AI bersifat deterministik (rule-based, tanpa LLM) — sama dengan seluruh insight di Analytics & AI Insights.
