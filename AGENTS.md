# AGENTS.md

## Project Overview

**Purchasing dashboard** — frontend-only Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui app with 14 purchasing pages in a sidebar. Real dataset (`purchase-data.json`, ~3,010 invoice line items); never use mock data.

## Key Files

- `prompt.md` — Complete page-by-page spec (14 pages, widget/table definitions, data rules)
- `polish.md` — Responsive polish spec (fluid type scale, mobile table strategies, breakpoints 375/640/1024). Respect these patterns in new UI work.
- `purchase-data.json` — Dataset (repo root, imported into `dashboard/src/data/`)
- `dashboard/` — The app; all work happens here

## Development Commands

```bash
cd dashboard
npm install
npm run dev       # Vite dev server (host: true, port 5173)
npm run lint      # oxlint (config: .oxlintrc.json)
npm run build     # tsc -b (typecheck, noEmit) && vite build — this IS the typecheck step
npm run preview   # Preview production build
```

- There is **no separate typecheck script** — `npm run build` runs `tsc -b` first.
- Verify with `npm run lint` then `npm run build` before finishing.

## Data Handling (Critical)

- **Numeric fields are strings** in the JSON: `quantity`, `unitCost`, `poUnitCost`, `netTotal`, `qtyOrdered`, `poPiDays`, `prPiDays`, `poPiOverdueDays`. Parse with `parseAllItems()` (`utils/formatters.ts`) before math.
- **Gotcha**: `parsePurchaseItem()` converts empty string `""` to `0`, not `NaN`/`null`. Pages therefore guard with `> 0` filters (e.g. `poPiDays > 0`, `qtyOrdered > 0`) rather than null checks — follow this pattern. Empty values render as `-` in the UI.
- Only invoiced transactions (types PI/PN/PURBB). No goods-receiving, QC, or reject data.
- `itemCategory` has exactly 5 values: `BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`.

## Placeholder Pages (Never Fabricate Data)

Pages #4 (Supplier Quality), #11 (Outstanding PO), #12 (Open PO), #13 (Closed PO) must stay empty-state via the `EmptyState` component with the existing messages. No invented numbers, ever.

## TypeScript Gotchas

- `verbatimModuleSyntax: true` — type-only imports must use `import type`.
- `noUnusedLocals`/`noUnusedParameters` are errors — build fails on unused vars.
- Path alias `@/` → `./src/` (in `vite.config.ts` + `tsconfig.app.json`); shadcn CLI reads it, so `npx shadcn@latest add <component> -o` works non-interactively (needs network to ui.shadcn.com).

## UI Conventions

- All labels in Indonesian; currency as `Rp 1.234.567` (`formatRupiah`), percentages 1 decimal (`formatPercent`)
- Date range filter (via `DateFilter`) drives every page's widgets/table/chart; filtering uses `filterByDateRange()` (defaults to `purchaseDate`, some pages pass `poDate`/`prDate`)
- Page shell: stat widget cards (`StatCard`) → chart/table; `PageLayout` wraps pages, `ChartCard` wraps Recharts charts (CSS vars `--color-chart-1..5`, cartesian grid uses `stroke-border`)
- Tables use `DataTable` (search, sortable headers, pagination "Halaman X dari Y", Export CSV/Excel/PDF, "Kolom" column toggle with grouped categories)
- Proxy-metric pages carry an `InfoBanner` note explaining the data limitation (e.g. Supplier Delivery, Supplier Scorecard)
- Dark mode: `ThemeToggle` toggles `.dark` on `<html>`, persists via `localStorage` key `theme` (no next-themes in app code)
- Responsive rules from `polish.md`: no page-level horizontal scroll; tables use horizontal-scroll container with sticky first column; fluid type scale, min 12px text

## Project Structure

```
dashboard/src/
├── components/
│   ├── ui/           # shadcn/ui (button, card, chart, sidebar, table, ...)
│   ├── dashboard/    # sidebar blocks (AppSidebar, SiteHeader, SectionCards)
│   ├── Layout.tsx    # SidebarProvider + AppSidebar + SiteHeader shell
│   ├── PageLayout.tsx # Shared page shell (title + date filter + content)
│   ├── StatCard.tsx  # KPI stat card
│   ├── DataTable.tsx # Sortable/exportable table with column toggle
│   ├── DateFilter.tsx
│   ├── ChartCard.tsx # Chart wrapper (Card + header)
│   ├── EmptyState.tsx # Placeholder pages
│   ├── InfoBanner.tsx # Data-limitation notes
│   └── ThemeToggle.tsx
├── pages/            # 14 pages (PurchaseSummary, PurchaseBySupplier, ... ClosedPO)
├── utils/formatters.ts # parseAllItems, formatRupiah, formatPercent, filterByDateRange
├── types/purchase.ts  # PurchaseItem / ParsedPurchaseItem
├── data/purchase-data.json
└── lib/              # cn() helper
```

## Per-Page Notes (from prompt.md)

- #1 Purchase Summary: full line-item table with grouped "Kolom" column picker (default columns: purchaseNumber, purchaseDate, supplierName, itemName, warehouse, quantity, uom, netTotal)
- #5 Supplier Delivery: proxy metric from `poPiDays`/`poPiOverdueDays` (PO→Invoice, not goods receipt)
- #6 Purchase Price History: item dropdown (`itemName`) required alongside date filter; prompt state if none selected
- #7 Purchase Variance: `variance = quantity - qtyOrdered` only where `qtyOrdered > 0`; rows with variance ≠ 0
- #8 Material Cost Trend: scope only `BAHAN BAKU` + `BAHAN PENDUKUNG`, category toggle, monthly `netTotal` by month
- #9 Price Increase Alert: per-item sequential `unitCost` increase ≥ threshold (default 10%), severity-highlighted rows
- #10 Purchase Lead Time: histogram buckets 0-3/4-7/8-14/15+ hari; only `prPiDays`/`poPiDays` exist — don't invent PR→PO figures
- #14 Supplier Scorecard: score = avg(price score, timeliness score), both 0-100; rating badge Excellent ≥80 / Good 60-79 / Perlu Perhatian <60