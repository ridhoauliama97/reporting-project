# Transfer History (Riwayat Transfer)

## Deskripsi
Laporan riwayat transfer antar gudang per baris item (memo transfer): gudang asal → tujuan, kuantitas dikirim vs diterima, status penerimaan, dan nilai.

## Kegunaan
Audit perpindahan barang antar gudang, memantau transfer yang belum diterima (pending), dan menelusuri riwayat barang berdasarkan nomor memo.

## Data yang Diproses
- `transfer`: `memoNumber`, `transferDate`, `receivedDate`, `originWarehouse*`, `destinationWarehouse*`, `itemName`, `quantity`, `receivedQuantity`, `received`, `lineTotal`
- Status: `Received` / `Pending`; seluruh record berstatus `void = Active`

## Catatan
- Filter tanggal berlaku pada tanggal transfer (`transferDate`).
- Satu memo dapat terdiri dari beberapa baris item.