# Stock Adjustment (Koreksi Stok)

## Deskripsi
Laporan koreksi stok per gudang: penambahan (CR) dan pengurangan (DB) dari record adjustment berstatus **approved**.

## Kegunaan
Memantau volume dan nilai koreksi stok — koreksi yang tinggi menandakan masalah pada proses penerimaan, pencatatan, atau kontrol internal.

## Data yang Diproses
- `adjustment`: `adjustmentDate`, `warehouseCode`, `warehouseName`, `quantityCR`, `quantityDB`, `adjustedValue`
- Qty masuk (CR) dan qty keluar (DB) dijumlahkan per gudang

## Catatan
- Hanya record berstatus `Approved` yang ditampilkan (seluruh record di dataset berstatus approved).
- Filter tanggal berlaku pada tanggal adjustment (`adjustmentDate`).
- Nilai bersih = total `adjustedValue` (dapat negatif untuk koreksi pengurangan).