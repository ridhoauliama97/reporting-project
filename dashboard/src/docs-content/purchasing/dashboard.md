# Dashboard (Landing Page)

## Deskripsi
Halaman utama aplikasi — titik masuk yang merangkum statistik **keseluruhan** laporan purchasing dan insight utama sesuai rentang tanggal aktif.

## Fitur
- **4 kartu statistik utama** — Total Nilai Pembelian, Jumlah Transaksi, Supplier Aktif, dan Rata-rata Nilai per Transaksi, lengkap dengan tren (badge naik/turun) dibandingkan periode sebelumnya
- **Ringkasan AI Keseluruhan** — satu ringkasan otomatis yang menggabungkan total pembelian, kategori terbesar, supplier terbesar, tingkat keterlambatan, lead time rata-rata, kenaikan harga, selisih qty, dan anomali (diperbarui mengikuti filter tanggal; bukan per laporan)
- **Mini preview 6 laporan** — snapshot singkat yang memengaruhi keputusan, masing-masing dengan tautan menuju laporan penuh:
  - Kategori Pembelian (per 5 kategori) → Purchase Summary
  - Supplier Terbesar (top 3) → Supplier Ranking
  - Keterlambatan Pengiriman → Supplier Delivery
  - Lead Time Rata-rata (PR→Invoice, PO→Invoice) → Supplier Lead Time
  - Kenaikan Harga (alert ≥ 10%) → Price Increase Alert
  - Selisih Qty / Variance → Purchase Variance

## Data yang Diproses
Seluruh baris invoice (`PI`/`PN`/`PURBB`) sesuai filter tanggal aktif, dengan rentang periode sebelumnya untuk perhitungan tren.

## Catatan
- Halaman ini menggantikan Purchase Summary sebagai landing page (`/dashboard`); Purchase Summary kini hanya berisi tabel line-item penuh.
- Ringkasan AI bersifat deterministik (rule-based, tanpa LLM) — sama dengan seluruh insight di Analytics & AI Insights.