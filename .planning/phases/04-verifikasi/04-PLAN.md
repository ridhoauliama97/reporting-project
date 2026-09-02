# Phase 4 — Verifikasi menyeluruh + laporan ke user

## E2E (Playwright)
- `/login` → login benar → cookie `__Secure-better-auth.session_token` → `/dashboard`.
- Buka tiap 33 route laporan; pastikan tidak error (halaman render, tabel/chart ada).
- Catat route yang EmptyState (Cycle/Picking/Packing) — itu disengaja.

## Audit data per menu (faktual)
- Untuk tiap laporan, cek angka agregat ≠ 0/palsu, sumber recordType jelas.
- Tabel: `laporan → recordType → file mentah → jumlah data`.

## Ringkasan ke user
- 10 file mentah → dipakai (Purchasing 3 + Warehouse 7).
- 2 file mentah tidak jadi laporan: `StockActivitiesSummary` (metadata), `Outstanding_PR_by_hod` (ringkasan HOD).
- 3 laporan EmptyState tanpa sumber: Cycle Count Accuracy, Picking Accuracy, Packing Accuracy.
- Auth/supabase: hasil E2E (login OK, no error).
- Status version/CI: siap commit? commit `feat(data): ...` (versi naik minor).