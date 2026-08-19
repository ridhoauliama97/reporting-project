# Open PO

## Deskripsi
Daftar Purchase Order yang **belum ter-invoice** — statusnya masih aktif/berjalan karena belum ada invoice terkait.

## Kegunaan
Monitoring komitmen pembelian yang masih berjalan — berapa banyak PO aktif dan total nilainya, agar tim bisa memproyeksikan cash flow/kebutuhan gudang ke depan.

## Sumber Data
File PO (`purchase-order-by-item`) — **bukan** dari dataset invoice. Dataset PO tidak menyimpan field status `open`/`closed`, sehingga status diturunkan dari ada-tidaknya nomor invoice pada baris PO (`purchaseInvoice`): baris dengan invoice kosong dianggap **open**.

## Filter
- Filter tanggal (sidebar atas) berlaku pada **Tanggal PO** (`orderDate`).
- Kartu "PO Tertua" menampilkan nomor PO dengan tanggal order paling awal.

## Catatan
Terdapat 48 baris PO tanpa invoice (belum ter-invoice). PO yang sudah ter-invoice namun masih ada sisa kuantitas tetap tercatat di laporan **Outstanding PO**.