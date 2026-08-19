# AGENTS.md

## Project Overview

**Purchasing dashboard** — frontend-only Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui app. Real dataset (`purchase-data.json`, ~3,010 invoice line items); never use mock data. Sidebar has a standalone **Dashboard** menu at the top (landing `/dashboard` — 4 KPI cards with trend, overall AI summary, 6 report previews), then one active group (**Purchasing**, 16 items: 14 reports + Reports & Exports + Analytics & AI Insights; **Warehouse** group is disabled "Coming Soon") and a footer **Documentation** link that opens `/docs` in a new tab. Purchase Summary keeps only the full line-item table.

## Key Files

- `prompt.md` — Complete page-by-page spec (14 pages, widget/table definitions, data rules). Trust it unless the user overrides.
- `polish.md` — Responsive polish spec (fluid type scale, mobile table strategies, breakpoints 375/640/1024). Respect these patterns in new UI work.
- `purchase-data.json` — Dataset (repo root, imported into `dashboard/src/data/`)
- `dashboard/` — The app; all work happens here
- `dashboard/vercel.json` — SPA rewrite (`/(.*)` → `/index.html`); client routes 404 without it
- `dashboard/scripts/version.mjs` — Computes app version from git commit messages; see CI/CD below

## Development Commands

```bash
cd dashboard
npm install
npm run dev       # Vite dev server (host: 0.0.0.0, port 5173) — reachable via LAN IP
npm run lint      # oxlint (config: .oxlintrc.json)
npm run build     # tsc -b (typecheck, noEmit) && vite build — this IS the typecheck step
npm run preview   # Preview production build
```

- There is **no separate typecheck script** — `npm run build` runs `tsc -b` first.
- Verify with `npm run lint` then `npm run build` before finishing.
- `npm install` prints an `allow-scripts` warning for `core-js` postinstall — harmless (it only shows a funding message); no action needed.

## CI/CD & Dynamic Version (Critical)

- Development happens on feature branches (e.g. `fix/laporan-purchasing`); **only pushing to `main` triggers production deploy** — branch pushes run lint+build via PR checks but never deploy.
- Push to `main` → GitHub Actions (`ci.yml`): lint+build, then auto-deploy production to Vercel (`database-report-gsu.vercel.app`). Both must pass.
- **Commit message drives the version** (`scripts/version.mjs`): `^(feat|perf)(\(.+\))?:` → minor+1 (patch reset to 0); all other prefixes (fix/ci/docs/...) → patch+1. Baseline commit = `1.0.0`. The script counts the commit itself — run it **after** committing to see the new version (before commit it reports the previous one).
- The deploy job MUST check out with `fetch-depth: 0` — with a shallow clone the script only sees 1 commit and reports `1.0.0` (debugged and fixed in commit `643853a`; don't regress this).
- Sidebar footer shows `v{__APP_VERSION__}` — a Vite define fed via `--build-env APP_VERSION` in the deploy step.
- **Verifying a deployed version**: the version string is split by JSX, so grep the production bundle for the exact pattern `` `v`,`X.Y.Z` `` — a plain `grep "1.6.1"` matches data noise (e.g. "1.1.10"). Lazy pages are separate chunks (`/assets/DocsPage-*.js` etc.), referenced only inside the index bundle.
- Vercel **preview deployments are SSO-protected** (302 to `vercel.com/sso-api`) — they can't be inspected via curl.

## Data Handling (Critical)

- **Dataset is loaded at runtime, not bundled**: `src/data/purchase-data.json` is imported via `?url` in `App.tsx` and fetched with `JSON.parse`-style `res.json()` — keeps the ~20 MB JSON (and its parse cost) out of the main bundle. `App` gates dashboard routes on `allItems.length` (loading spinner / error + retry). Don't re-import the JSON statically anywhere — it would re-inflate the index bundle.
- **Numeric fields are strings** in the JSON: `quantity`, `unitCost`, `poUnitCost`, `netTotal`, `qtyOrdered`, `poPiDays`, `prPiDays`, `poPiOverdueDays`. Parse with `parseAllItems()` (`utils/formatters.ts`) before math.
- **Gotcha**: `parsePurchaseItem()` converts empty string `""` to `0`, not `NaN`/`null`. Pages therefore guard with `> 0` filters (e.g. `poPiDays > 0`, `qtyOrdered > 0`) rather than null checks — follow this pattern. Empty values render as `-` in the UI.
- Only invoiced transactions (types PI/PN/PURBB). No goods-receiving, QC, or reject data.
- **PO/PR records exist too**: the merged JSON carries `recordType: "po"` (2,996 lines) and `"pr"` (2,650, deduped). Parse with `parseAllPurchaseOrders()` (`formatters.ts`); filter by `orderDateObj` via `filterPurchaseOrdersByDateRange()`. App passes `poItems` (date-filtered) to the three PO pages.
- PO status is derived, not stored: **Open** = `purchaseInvoice === ""`, **Closed** = `purchaseInvoice` filled, **Outstanding** = `qtyOutstanding > 0`. `pctDelivered` is a fraction (1.0000 = 100%), not a percent — multiply by 100 for display.
- `itemCategory` has exactly 5 values: `BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`.

## Placeholder Pages (Never Fabricate Data)

Page #4 (Supplier Quality) must stay empty-state via the `EmptyState` component with the existing message. No invented numbers, ever. Its docs page explains why (data not in dataset) — keep that explanation in sync.

## TypeScript Gotchas

- `verbatimModuleSyntax: true` — type-only imports must use `import type`.
- `noUnusedLocals`/`noUnusedParameters` are errors — build fails on unused vars.
- Path alias `@/` → `./src/` (in `vite.config.ts` + `tsconfig.app.json`); shadcn CLI reads it, so `npx shadcn@latest add <component> -o` works non-interactively (needs network to ui.shadcn.com).

## UI Conventions

- All labels in Indonesian; currency as `Rp 1.234.567` (`formatRupiah`), percentages 1 decimal (`formatPercent`)
- Date range filter (via `DateFilter`) drives every page's widgets/table/chart; filtering uses `filterByDateRange()` (defaults to `purchaseDate`, some pages pass `poDate`/`prDate`)
- Page shell: stat widget cards (`StatCard`) → chart/table; `PageLayout` wraps pages, `ChartCard` wraps Recharts charts (CSS vars `--color-chart-1..5`, cartesian grid uses `stroke-border`)
- **All DataTable report pages** use `showExport` + `showColumnToggle` + `title` (export filename); `totalColumns` only for summable numeric columns (skip averages/percentages/scores/durations: lead-time, price-alert, scorecard have no total row)
- Proxy-metric pages carry an `InfoBanner` note explaining the data limitation (e.g. Supplier Delivery, Supplier Scorecard)
- Dark mode: `ThemeToggle` toggles `.dark` on `<html>`, persists via `localStorage` key `theme` (no next-themes in app code)
- Responsive rules from `polish.md`: no page-level horizontal scroll; tables use horizontal-scroll container with sticky columns; fluid type scale, min 12px text

## DataTable Gotchas (hard-earned)

- **The real scroller is the shadcn `Table` wrapper div** (`data-slot="table-container"`), not any outer wrapper. `ui/table.tsx`'s `Table` accepts `tableContainerRef`, and `DataTable` drives its scroll indicators (`canScrollLeft`/`canScrollRight`, sticky-column shadow) from it. Don't wrap DataTable in another `overflow-x-auto` — the inner one scrolls.
- **Row keys must be unique**: one invoice has many line items, so `purchaseNumber` alone as a React key corrupts the DOM when sorting. `DataTable` uses the composite key `${purchaseNumber}-${originalIndex}` internally.
- "No" column is sortable via pseudo-key `__no__` and shows the row's **original index** (via `originalIndexMap`), not the page position.
- Column type is `{ key, label, sortable?, align?, render? }` (local `interface Column<T>`, not TanStack).

## Documentation Hub (docs)

- Route `/docs` renders **outside** the dashboard `Layout` shell (`App.tsx` has `<Route path="/docs">` as a sibling of the `path="*"` Layout wrapper); it has its own shell (header + `ThemeToggle` + back link).
- Content lives in `dashboard/src/docs-content/{menu}/{slug}.md` (markdown), registered in `docs-content/index.tsx` (`DOCS_MENUS`, `getDocContent`, `resolveDoc`). **Adding a menu = new folder + one config entry** — no component changes.
- `DOCS_MENUS` mirrors the dashboard sidebar: menus & submenus use the **same lucide icons as `nav-config.tsx`**, titles match sidebar 1:1 (Statistics Overview → Dashboard; Purchasing → 16 submenus; Overview → Tentang Aplikasi/Istilah). DocsSubmenu has an `icon` field rendered by `DocsPage`.
- `DocsPage.tsx` renders markdown with `react-markdown` **+ `remark-gfm`** (tables must not regress to raw `|` text); styling is plain CSS under `.docs-content` in `index.css` (not a Tailwind typography plugin).
- Every page has a matching `.md` doc; update both when a page's behavior changes (spec: `prompt.md` per-page notes live in "Per-Page Notes" below).

## Analytics & AI Insights

`utils/analytics.ts` is a **deterministic rule-based engine** (no LLM, no backend, no API calls — the app is frontend-only). Threshold constants live at the top of the file. `AnalyticsInsights.tsx` renders summaries, recommendations (Info/Perhatian/Urgent), anomaly detection, spend analysis, and a chat sheet ("Tanya Data") with source links via `REPORT_PATHS`. Don't add LLM integration without an explicit ask.

## Shared Utils Conventions

- **`round1`/`round2` live only in `utils/formatters.ts`** (single source of truth, imported by both `analytics.ts` and `reports.ts`). Never redefine them locally in another module.
- `utils/reports.ts` exports `REPORTS` (a `ReportDefinition[]` catalog) that both `ReportsExports.tsx` and `AnalyticsInsights.tsx` consume — the export shape of every report is defined once there, not in the pages. PO reports (outstanding/open/closed) use the optional `getPoData(poItems)` field (input `ParsedPurchaseOrder[]`, date-filtered); non-PO reports use `getData(items)`. `ReportsExports` picks `getPoData` when present. Both pages receive `poItems` from App.

## Project Structure

```folder structure
dashboard/src/
├── components/
│   ├── ui/           # shadcn/ui (button, card, chart, sidebar, table, ...)
│   ├── dashboard/    # app-sidebar, site-header, section-cards, nav-config
│   ├── Layout.tsx    # SidebarProvider + AppSidebar + SiteHeader shell (dashboard pages only)
│   ├── PageLayout.tsx # Shared page shell (title + date filter + content)
│   ├── StatCard.tsx  # KPI stat card
│   ├── DataTable.tsx # Sortable/exportable table with column toggle
│   ├── DateFilter.tsx
│   ├── ChartCard.tsx # Chart wrapper (Card + header)
│   ├── EmptyState.tsx # Placeholder pages
│   ├── InfoBanner.tsx # Data-limitation notes
│   └── ThemeToggle.tsx
├── pages/            # Dashboard + 14 reports + ReportsExports, AnalyticsInsights, DocsPage, WarehousePlaceholder
├── docs-content/     # {menu}/{slug}.md + index.tsx config (see Documentation Hub)
├── utils/formatters.ts # parseAllItems, formatRupiah, formatRupiahCompact, formatPercent, filterByDateRange, round1, round2
├── utils/analytics.ts  # rule-based insight engine (no LLM)
├── utils/exporter.ts   # CSV/Excel/PDF export (used by DataTable + ReportsExports)
├── utils/reports.ts    # REPORTS catalog (ReportDefinition/ReportExport): defines every report's export shape; imported by ReportsExports + analytics
├── types/purchase.ts  # PurchaseItem / ParsedPurchaseItem
├── data/purchase-data.json  # fetched at runtime via ?url import (see Data Handling)
└── lib/              # cn() helper
```

## Per-Page Notes (from prompt.md)

- #1 Purchase Summary: full line-item table with grouped "Kolom" column picker (default columns: purchaseNumber, purchaseDate, supplierName, itemName, warehouse, quantity, uom, netTotal); totals row via `totalColumns` prop
- #5 Supplier Delivery: proxy metric from `poPiDays`/`poPiOverdueDays` (PO→Invoice, not goods receipt)
- #6 Purchase Price History: item picker is a searchable combobox (Popover + Command, match highlighting on the active item); item required alongside date filter; prompt state if none selected
- #7 Purchase Variance: `variance = quantity - qtyOrdered` only where `qtyOrdered > 0`; rows with variance ≠ 0
- #8 Material Cost Trend: all 5 `itemCategory` values; checkbox filter (all checked by default); chart/table follow checked categories; monthly `netTotal` by month
- #9 Price Increase Alert: per-item sequential `unitCost` increase ≥ threshold (default 10%), severity-highlighted rows
- #10 Purchase Lead Time: histogram buckets 0-3/4-7/8-14/15+ hari; only `prPiDays`/`poPiDays` exist — don't invent PR→PO figures
- #11 Outstanding PO: rows where `0 < qtyDelivered < qtyOrdered` (received partially) from `poItems`, grouped per PO number (one row per PO: item count, aggregated qty, % delivered, PO value); StatCards = PO count, item-line count, total PO value, qty not yet received; bar chart = PO value per supplier (top 10); date filter applies to `orderDate`
- #12 Open PO: rows where `qtyDelivered === 0` (no delivery yet) from `poItems`, grouped per PO number (same layout as #11); StatCards = PO count, item-line count, total order value, qty not yet received; bar chart = PO value per supplier (top 10)
- #13 Closed PO: rows where every line of a PO has `qtyDelivered >= qtyOrdered` (fully received), grouped per PO number (same layout as #11/#12); StatCards = PO count, item-line count, total order value, qty not yet received (always 0); bar chart = PO value per supplier (top 10); all three PO pages show an InfoBanner explaining the derived status (no open/closed field in source)
- #14 Supplier Scorecard: score = avg(price score, timeliness score), both 0-100; rating badge Excellent ≥80 / Good 60-79 / Perlu Perhatian <60
