# Supplier Lead Time (Lead Time Pembelian)

## Deskripsi
Distribusi lama waktu proses pembelian — dari tanggal diperlukan (Required) hingga invoice — disajikan sebagai histogram dan tabel detail per transaksi.

## Fitur
- **4 kartu statistik**: Rata-rata Required→PR, Rata-rata PR→PO, Rata-rata PO→Invoice, Lead Time PO→Invoice Terlama
- **Chart**: histogram `poPiDays` dengan bucket:
  - `0-3 hari`
  - `4-7 hari`
  - `8-14 hari`
  - `15+ hari`
- **Tabel**: Nomor PR, Tanggal PR, Nomor PO, Tanggal PO, Nomor Purchase, Tanggal Purchase, Required→PR (hari), PR→PO (hari), PO→Invoice (hari)

## Formula 3 Tahap
```
Required→PR  = Tanggal PR - Tanggal Diperlukan (Required Date)
PR→PO        = Tanggal PO - Tanggal PR
PO→Invoice   = Tanggal Purchase - Tanggal PO  (poPiDays)
```

## Sumber Data
Dataset `purchase-request-by-item` (Required Date) digabung dengan `purchase-by-item` (PR/PO/Purchase Date) — ketiga tahap dihitung saat pembuatan file data laporan. Filter tanggal berlaku pada **tanggal purchase** (invoice).

## Catatan
Periode ini `PR→PO` dan `Required→PR` hampir selalu terisi (PO Number tercantum di 99,3% PR) sehingga ketiga tahap dapat dianalisis secara penuh.