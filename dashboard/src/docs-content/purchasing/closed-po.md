# Closed PO

## Deskripsi
Daftar Purchase Order yang **sudah ter-invoice** — proses pembelian sudah berjalan sampai ke penagihan.

## Kegunaan
- Rekam historis PO yang sudah ter-invoice
- Dasar audit atau verifikasi bahwa suatu proses pembelian sudah tertutup dengan benar

## Sumber Data
File PO (`purchase-order-by-item`) — **bukan** dari dataset invoice. Dataset PO tidak menyimpan field status `open`/`closed`, sehingga status diturunkan dari ada-tidaknya nomor invoice pada baris PO (`purchaseInvoice`): baris dengan invoice terisi dianggap **closed**.

## Filter
- Filter tanggal (sidebar atas) berlaku pada **Tanggal PO** (`orderDate`).
- Kolom `Hari PO→Invoice` (`poPiDays`) menampilkan selisih hari antara tanggal PO dan tanggal invoice.

## Catatan
Sebagian besar baris PO (2.948 dari 2.996) sudah memiliki invoice. `% Diterima` disimpan sebagai fraksi (1.0000 = 100%) di sumber data — ditampilkan sebagai persen di laporan ini.