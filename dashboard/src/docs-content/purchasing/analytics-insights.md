# Analytics & AI Insights

## Deskripsi

Lapisan analisis otomatis di atas data seluruh laporan — ringkasan, rekomendasi, deteksi anomali, analisis pengeluaran, dan tanya jawab — digerakkan oleh **Date Filter yang sama** dengan halaman laporan lain.

> Catatan: aplikasi ini berjalan frontend-only tanpa backend/LLM eksternal. Insight dihasilkan oleh **mesin analisis rule-based deterministik** yang menghitung langsung dari dataset — bukan model AI eksternal, bukan data rekaan.

## Fitur

### AI Summaries per Submenu

Ringkasan naratif otomatis untuk setiap laporan (#1-#14), dihasilkan on-demand lewat tombol "Generate Insight" / "Regenerasi". Hanya laporan placeholder (#4 Supplier Quality) yang menghasilkan ringkasan jujur tentang keterbatasan data; laporan PO (#11-13) kini punya ringkasan berbasis data PO asli.

### Decision Support (Rekomendasi Keputusan)

Rekomendasi actionable dengan tingkat urgensi: **Info / Perhatian / Urgent**, bersumber dari laporan terkait (konsentrasi supplier, keterlambatan, kenaikan harga, variance negatif, skor rendah).

### Anomaly Detection

Deteksi deviasi dari pola historis:

- Harga item vs rata-rata 3 bulan terakhir (baseline) ≥ 30% (urgent ≥ 60%)
- Lonjakan volume/spend ≥ 40% dari baseline
- Tingkat keterlambatan tinggi (≥ 50% dan ≥ 3 transaksi)
- Frekuensi pembelian tidak wajar (≥ 12 transaksi)

### Spend Analysis (Potensi Hemat)

Identifikasi peluang penghematan & konsolidasi:

- Konsolidasi order antar supplier (estimasi hemat ~8%)
- Single-sourcing berisiko (estimasi ~5%)
- PO kecil (< Rp 1 juta) yang mendominasi
- Dominasi kategori pengeluaran

### Chat Q&A ("Tanya Data")

Tanya jawab bebas ke data — mendukung scope "semua data", "bulan ini", nama bulan/tahun, serta topik: keterlambatan, top supplier, jumlah supplier, kategori, lead time, item termahal, variance, gudang, skor supplier, potensi hemat, dan total pembelian.

Setelah bot menjawab, muncul chip **"Lanjut: …"** berisi pertanyaan lanjutan kontekstual (satu klik untuk langsung bertanya), sehingga eksplorasi berlanjut tanpa mengetik ulang.

## Data yang Diproses

Agregasi dari seluruh 14 submenu laporan, mengikuti rentang Date Filter aktif. Untuk perbandingan historis (anomaly), digunakan data di luar rentang sebagai baseline.
