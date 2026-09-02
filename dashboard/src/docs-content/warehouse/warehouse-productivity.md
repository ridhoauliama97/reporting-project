# Warehouse Productivity (Produktivitas Pabrik/Gudang)

## Deskripsi
Laporan produktivitas diukur dari catatan produksi: total kuantitas yang diproduksi dibanding jam produksi (unit per jam), dirinci per mesin/sumber daya, operator, dan lini.

## Kegunaan
Membandingkan produktivitas antar mesin/operator/lini dan memantau tren bulanan output serta biaya produksi.

## Definisi Metrik
- **Total Produksi** — penjumlahan `quantity` pada record `production`
- **Jam Produksi** — penjumlahan field `productionHour`
- **Biaya Produksi** — penjumlahan `totalCog`
- **Unit/Jam** — `total produksi ÷ jam produksi` (rata-rata per periode)
- Tabel dirinci per mesin/sumber daya (fallback ke operator bila `machine` kosong)

## Status Saat Ini: Real Data (proxy)
Dataset `warehouse-data.json` berisi record `production` (±45 ribu baris) sehingga laporan dapat menampilkan angka riil. Metrik unit/jam bersifat **proksi** — bukan hasil pengukuran time-and-motion; jam produksi diambil dari field `Production Hour` pada setiap record.