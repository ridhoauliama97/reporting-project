# Inventory Value (Nilai Persediaan)

## Deskripsi
Laporan nilai persediaan per gudang berdasarkan snapshot stok: nilai setiap item dihitung dari **on-hand × harga beli terakhir (last purchase cost)**.

## Kegunaan
Mengetahui nilai uang yang tertanam di persediaan per gudang — dasar pengambilan keputusan alokasi modal, asuransi stok, dan identifikasi gudang dengan konsentrasi nilai tertinggi.

## Data yang Diproses
- `stock` (snapshot per `date` di data sumber, 2.861 baris): `onHand`, `lastPurchaseCost`, `warehouseCode`, `warehouseName`
- Nilai item = `onHand × lastPurchaseCost`

## Catatan
- Data stok merupakan **snapshot** — halaman ini tidak memiliki filter tanggal.
- Item dengan on-hand negatif tetap dihitung sesuai nilai aktualnya.
- Baris stok tanpa nama gudang ditampilkan dengan kode gudang sebagai gantinya.