# Warehouse Productivity (Produktivitas Proses di Gudang)

## Deskripsi
Laporan produktivitas proses dipakai sebagai ukuran efisiensi produksi di gudang: output yang dihasilkan dibanding material yang terpakai (yield), kuantitas dan biaya produksi per lini, serta tren bulanan.

## Kegunaan
Membandingkan produktivitas antar lini produksi dan memantau tren bulanan output vs pemakaian material.

## Definisi Metrik
- **Total Produksi** — penjumlahan `quantity` pada record `production` (hanya nilai > 0)
- **Biaya Produksi** — penjumlahan `totalCog`
- **Material Terpakai** — penjumlahan `quantity` pada record `productionMaterial`
- **Output** — penjumlahan `quantity` pada record `productionOutput`
- **Rasio Output / Material (yield)** — `output ÷ material × 100`
- Tabel dirinci per lini produksi (`lineName`)

## Status Saat Ini: Real Data (proxy)
Dataset `warehouse-data.json` berisi record `production`, `productionMaterial`, dan `productionOutput` sehingga laporan dapat menampilkan angka riil. **Catatan**: snapshot ini tidak menyertakan jam kerja, mesin, maupun operator (field kosong di sumber), sehingga metrik unit/jam atau transaksi per pegawai tidak dapat dihitung — metrik yang ditampilkan adalah yield output/material sebagai proksi produktivitas.