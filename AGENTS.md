# AGENTS.md

## Project Overview

This is a **purchasing dashboard** frontend-only project built with Vite + React + TypeScript + Tailwind CSS + shadcn/ui. The dashboard has 14 purchasing-related pages with sidebar navigation.

## Key Files

- `prompt.md` — Complete specification for the dashboard (14 pages, UI conventions, data handling rules)
- `purchase-data.json` — Real dataset: ~3,010 purchase invoice line items
- `dashboard/` — Main application directory

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (CLI-installed, radix-nova style, `radix-ui` consolidated package)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Date Utils**: date-fns with Indonesian locale
- **Export**: xlsx (Excel), jspdf + jspdf-autotable (PDF)
- **UI Components**: shadcn/ui — installed via `npx shadcn@latest add <component> -o` (CLI needs network to ui.shadcn.com; init preset: `-b radix -p nova`)

## Data Handling Rules (Critical)

- **String-to-number conversion**: Numeric fields (`quantity`, `unitCost`, `poUnitCost`, `netTotal`, `qtyOrdered`, `poPiDays`, `prPiDays`, `poPiOverdueDays`) are stored as strings — parse to `Number` before any math
- **Empty strings**: `""` means no value — show as `-` in UI, exclude from averages/counts
- **Data limitation**: Only contains invoiced transactions (PI/PN/PURBB types). No goods-receiving, QC, or reject data
- **Categories**: Exactly 5 values: `BAHAN BAKU`, `BAHAN PENDUKUNG`, `SPAREPART`, `WORK IN PROGRESS`, `BARANG DAGANG`

## Placeholder Pages (No Fabricated Data)

Pages #4 (Supplier Quality), #11 (Outstanding PO), #12 (Open PO), #13 (Closed PO) must remain empty-state with placeholder messages. Do not invent data for these.

## UI Conventions

- All labels in Indonesian
- Currency formatted as Rupiah (`Rp 1.234.567`)
- Percentages to 1 decimal
- Date range filter drives all widgets/tables/charts
- Consistent page shell: stat widgets → chart/table
- **Date Filter**: Shows formatted date range (e.g., "01 Agu 2026 – 15 Agu 2026") with date pickers
- **Data Table**: Includes Export (CSV/Excel/PDF) and Kolom (column toggle) buttons with grouped categories
- **Pagination**: Shows "Halaman X dari Y" with Previous/Next buttons
- **Dark Mode**: Toggle in header, persists via localStorage, respects system preference

## Development Commands

```bash
cd dashboard
npm install
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components (Card, Button, Input, Table, Badge, Sidebar, DropdownMenu, Chart, ...)
│   │   ├── dashboard/    # dashboard-01 block components (AppSidebar, SiteHeader, SectionCards)
│   │   ├── Layout.tsx    # Main layout wrapper (SidebarProvider + AppSidebar + SiteHeader)
│   │   ├── StatCard.tsx  # KPI stat card component
│   │   ├── DataTable.tsx # Data table with sorting, pagination, export
│   │   ├── DateFilter.tsx # Date range filter
│   │   └── ThemeToggle.tsx # Dark mode toggle (toggles `.dark` on <html>)
│   ├── pages/            # 14 page components
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (formatters)
│   ├── lib/              # Utility functions (cn for className merging)
│   ├── hooks/            # use-mobile hook (from shadcn sidebar)
│   └── data/             # purchase-data.json
├── public/
├── components.json       # shadcn CLI config (aliases, style: radix-nova)
└── package.json
```

## Key Implementation Details

- **Path Alias**: `@/` maps to `./src/` (defined in both `vite.config.ts` using `import.meta.dirname` and `tsconfig.app.json`) — the shadcn CLI reads this, so `npx shadcn@latest add` works non-interactively
- **Data parsing**: All numeric fields parsed in `utils/formatters.ts` using `parseAllItems()`
- **Date filtering**: `filterByDateRange()` handles date-based filtering across all pages
- **Rupiah formatting**: `formatRupiah()` for currency display
- **Table component**: `DataTable` supports sorting, pagination, search, export (CSV/Excel/PDF), and column visibility toggle with grouped categories
- **Charts**: Recharts wrapped in `ChartCard` (Card + header) using CSS vars `--color-chart-1..5` for stroke/fill; cartesian grid uses `stroke-border`
- **Font**: Geist Variable (`@fontsource-variable/geist`) via `--font-sans` in the Tailwind theme
- **shadcn/ui**: Use `cn()` utility for className merging with Tailwind CSS