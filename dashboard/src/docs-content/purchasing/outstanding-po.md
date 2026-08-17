# Outstanding PO

## Deskripsi
Daftar Purchase Order yang barangnya **belum sepenuhnya diterima/di-invoice** — sisa kewajiban pengiriman dari supplier.

## Kegunaan
- Follow-up ke supplier untuk barang yang belum datang
- Acuan komitmen pembelian yang masih outstanding (belum terealisasi penuh)

## Formula Standar
```
Outstanding Qty = Qty Ordered - Qty Diterima/Invoiced
```
Baris ditampilkan jika hasilnya > 0.

## Data yang Seharusnya Diperlukan
Status PO + qty diterima/di-invoice per PO dari waktu ke waktu (bukan hanya qty yang di-order).

## Status Saat Ini: Placeholder (EmptyState)
Dataset yang ada hanya berisi transaksi **invoiced** (`PI`/`PN`/`PURBB`) — tidak ada tracking status penerimaan barang per PO untuk menghitung sisa outstanding. Lihat [Istilah & Definisi](../overview/glossary) untuk penjelasan tentang placeholder page.