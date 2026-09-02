# Supplier Quality (Kualitas Supplier)

## Deskripsi
Laporan kualitas barang yang diterima dari tiap supplier — biasanya berisi tingkat reject, hasil pemeriksaan QC, dan konsistensi kualitas per supplier dari waktu ke waktu.

## Kegunaan
Membantu tim purchasing menilai supplier mana yang kualitas barangnya konsisten bagus vs sering bermasalah — menjadi dasar evaluasi/negosiasi ulang kontrak supplier.

## Formula Standar
Formula yang umum dipakai untuk laporan sejenis (belum tentu persis sama dengan implementasi akhir — perlu konfirmasi ke sumber data PO/QC saat tersedia):

```
Quality Score = (Qty Diterima - Qty Reject) / Qty Diterima × 100%
Reject Rate   = Qty Reject / Qty Diterima × 100%
```

## Data yang Seharusnya Diperlukan
- Hasil inspeksi QC per penerimaan
- Catatan reject/retur barang
- Data penerimaan barang (goods receipt) per PO

## Status Saat Ini: Placeholder (EmptyState)
Dataset (`purchasing-data.json`) hanya berisi data invoice pembelian — **tidak ada** data QC, reject, atau goods receipt. Laporan ini belum bisa diisi angka apa pun sampai sumber data tersebut tersedia. Lihat [Istilah & Definisi](../overview/glossary) untuk penjelasan tentang placeholder page.