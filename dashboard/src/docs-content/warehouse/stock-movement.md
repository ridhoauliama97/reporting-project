# Stock Movement (Pergerakan Stok)

## Deskripsi
Laporan pergerakan stok masuk dan keluar per gudang per bulan, disusun dari tiga sumber data: **transfer** antar gudang, **adjustment** (koreksi stok), dan **usage** (pemakaian).

## Kegunaan
Memantau aktivitas pergerakan barang antar gudang, mendeteksi gudang dengan arus barang terbesar, dan memantau keseimbangan masuk vs keluar (net movement).

## Sumber Pergerakan
| Sumber | Arah | Kuantitas | Tanggal |
|---|---|---|---|
| Transfer (asal) | Keluar | `quantity` | `transferDate` |
| Transfer (tujuan) | Masuk | `receivedQuantity` | `receivedDate` |
| Adjustment CR | Masuk | `quantityCR` | `adjustmentDate` |
| Adjustment DB | Keluar | `quantityDB` | `adjustmentDate` |
| Usage | Keluar | `quantity` | `usageDate` |

## Catatan
- Filter tanggal berlaku pada tanggal masing-masing record (per sumber).
- Transfer yang belum diterima tetap dihitung sebagai keluar di gudang asal.