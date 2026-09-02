# Graph Report - reporting-project  (2026-08-19)

## Corpus Check
- 111 files · ~106,811 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 719 nodes · 1120 edges · 52 communities (43 shown, 9 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 54 edges (avg confidence: 0.84)
- Token cost: 25,014 input · 13,020 output

## Community Hubs (Navigation)
- Shared Dashboard Components
- App Routing & Pages
- Versioning & Data Parsing
- Dependencies & Libraries
- Analytics & AI Insights
- Purchasing Documentation
- Build Tooling & DevDeps
- Sidebar UI Kit
- TSConfig App Options
- shadcn Component Config
- Exports & Reports
- TSConfig Node Options
- Theme & Form Controls
- Dashboard Landing KPIs
- Recharts Chart Wrapper
- Sidebar Navigation
- Lint Configuration
- Input Group UI
- Favicon Design
- Docs Content Registry
- Tabs UI
- Social Icons
- Dashboard README
- Vite Brand Assets
- Site Header
- Toggle Group UI
- Hero Banner Asset
- React Logo Assets
- Badge UI
- Toggle UI
- Root TSConfig
- Vercel Config
- Icon Library

## God Nodes (most connected - your core abstractions)
1. `react` - 50 edges
2. `ParsedPurchaseItem` - 28 edges
3. `compilerOptions` - 21 edges
4. `PageLayout()` - 19 edges
5. `formatNumber()` - 15 edges
6. `compilerOptions` - 15 edges
7. `AGENTS.md — Project Conventions` - 15 edges
8. `prompt.md — Purchase Dashboard Spec` - 15 edges
9. `formatRupiah()` - 14 edges
10. `formatPercent()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Frontend-Only Build Decision (no backend, no LLM)` --rationale_for--> `Deterministic Rule-Based Analytics Engine`  [INFERRED]
  prompt.md → dashboard/src/docs-content/purchasing/analytics-insights.md
- `fetch-depth: 0 Requirement for Version Script` --rationale_for--> `Deploy to Vercel Job`  [EXTRACTED]
  AGENTS.md → .github/workflows/ci.yml
- `prompt.md — Purchase Dashboard Spec` --references--> `Item Category (5 values)`  [EXTRACTED]
  prompt.md → dashboard/src/docs-content/overview/overview.md
- `AnalyticsInsightsProps` --references--> `ParsedPurchaseItem`  [EXTRACTED]
  dashboard/src/pages/AnalyticsInsights.tsx → dashboard/src/types/purchase.ts
- `ReportsExportsProps` --references--> `ParsedPurchaseItem`  [EXTRACTED]
  dashboard/src/pages/ReportsExports.tsx → dashboard/src/types/purchase.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Glow Effect Composition** — dashboard_public_favicon_z_path, dashboard_public_favicon_glow_ellipses, dashboard_public_favicon_alpha_mask, dashboard_public_favicon_blur_filters [EXTRACTED 1.00]
- **Brand Logo Icons Set** — dashboard_public_icons_bluesky_icon, dashboard_public_icons_discord_icon, dashboard_public_icons_github_icon, dashboard_public_icons_x_icon [INFERRED 0.85]
- **Icons Form SVG Sprite** — dashboard_public_icons_bluesky_icon, dashboard_public_icons_discord_icon, dashboard_public_icons_documentation_icon, dashboard_public_icons_github_icon, dashboard_public_icons_social_icon, dashboard_public_icons_x_icon [EXTRACTED 1.00]
- **Vite Visual Identity System** — dashboard_src_assets_vite_vitelogo, dashboard_src_assets_vite_vitebuildtool, dashboard_src_assets_vite_darkmode [INFERRED 0.65]
- **Placeholder Pages Policy (never fabricate data)** — prompt_no_fabricated_data, dashboard_src_components_emptystate, dashboard_src_docs_content_overview_glossary_placeholder_page, dashboard_src_docs_content_purchasing_reports_exports [INFERRED 0.85]
- **Dashboard Landing Mini Previews of 6 Reports** — dashboard_src_docs_content_statistics_overview_dashboard, dashboard_src_docs_content_purchasing_purchase_summary, dashboard_src_docs_content_purchasing_supplier_ranking, dashboard_src_docs_content_statistics_overview_dashboard_src_docs_content_purchasing_supplier_delivery, dashboard_src_docs_content_statistics_overview_dashboard_src_docs_content_purchasing_purchase_lead_time, dashboard_src_docs_content_statistics_overview_dashboard_src_docs_content_purchasing_price_increase_alert, dashboard_src_docs_content_statistics_overview_dashboard_src_docs_content_purchasing_purchase_variance [EXTRACTED 1.00]
- **Commit-Driven Version Pipeline (commit → version.mjs → Vercel deploy)** — agents_commit_driven_version, dashboard_scripts_version, github_workflows_ci_deploy, agents_fetch_depth_zero [EXTRACTED 1.00]
- **Placeholder Pages (EmptyState) — Data Tidak Tersedia di Dataset** — dashboard_src_docs_content_purchasing_closed_po_doc, dashboard_src_docs_content_purchasing_open_po_doc, dashboard_src_docs_content_purchasing_outstanding_po_doc, dashboard_src_docs_content_purchasing_supplier_quality_doc [INFERRED 0.95]
- **Halaman yang Bergantung pada Field Status PO** — dashboard_src_docs_content_purchasing_open_po_doc, dashboard_src_docs_content_purchasing_closed_po_doc, dashboard_src_docs_content_purchasing_outstanding_po_doc [INFERRED 0.95]
- **Laporan Pelacakan Harga/Biaya** — dashboard_src_docs_content_purchasing_material_cost_trend_doc, dashboard_src_docs_content_purchasing_price_increase_alert_doc, dashboard_src_docs_content_purchasing_purchase_price_history_doc [INFERRED 0.85]

## Communities (52 total, 9 thin omitted)

### Community 0 - "Shared Dashboard Components"
Cohesion: 0.05
Nodes (83): ChartCard(), ChartCardProps, Column, ColumnGroup, DataTable(), DataTableProps, PAGE_SIZE_OPTIONS, stickyZone (+75 more)

### Community 1 - "App Routing & Pages"
Cohesion: 0.05
Nodes (34): index.html — Vite Entry HTML, App(), ClosedPO, DocsPage, getDefaultDateRange(), MaterialCostTrend, OpenPO, OutstandingPO (+26 more)

### Community 2 - "Versioning & Data Parsing"
Cohesion: 0.07
Nodes (44): AGENTS.md — Project Conventions, Commit-Driven Semver Versioning, fetch-depth: 0 Requirement for Version Script, Runtime JSON Loading via ?url (keep 2.5MB out of bundle), Numeric-Strings-as-Strings Parsing Convention ("" → 0, guard > 0), DateFilter(), DateFilterProps, DateRange (+36 more)

### Community 3 - "Dependencies & Libraries"
Cohesion: 0.05
Nodes (43): class-variance-authority, clsx, cmdk, dependencies, class-variance-authority, clsx, cmdk, date-fns (+35 more)

### Community 4 - "Analytics & AI Insights"
Cohesion: 0.12
Nodes (33): AnalyticsInsights, AnalyticsInsights(), AnalyticsInsightsProps, ChatMessage, DateRange, REPORT_PATHS, SectionHeaderProps, URGENCY_STYLES (+25 more)

### Community 5 - "Purchasing Documentation"
Cohesion: 0.08
Nodes (33): Istilah & Definisi (Glossary), Closed PO — Dokumentasi, Filter Kategori Checkbox (5 itemCategory), Material Cost Trends — Dokumentasi, Agregasi netTotal Bulanan (dari purchaseDate), Open PO — Dokumentasi, Placeholder Page (EmptyState), Field Status PO (open/closed) (+25 more)

### Community 6 - "Build Tooling & DevDeps"
Cohesion: 0.07
Nodes (28): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+20 more)

### Community 7 - "Sidebar UI Kit"
Cohesion: 0.08
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 8 - "TSConfig App Options"
Cohesion: 0.07
Nodes (26): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+18 more)

### Community 9 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Exports & Reports"
Cohesion: 0.13
Nodes (16): ReportsExports, DateRange, ReportsExports(), ReportsExportsProps, downloadBlob(), escapeCsvCell(), exportCsv(), exportData() (+8 more)

### Community 11 - "TSConfig Node Options"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 14 - "Dashboard Landing KPIs"
Cohesion: 0.18
Nodes (10): Dashboard, pctChange(), SectionCards(), SectionCardsProps, Dashboard(), DashboardProps, DateRange, getGreeting() (+2 more)

### Community 15 - "Recharts Chart Wrapper"
Cohesion: 0.21
Nodes (10): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+2 more)

### Community 20 - "Sidebar Navigation"
Cohesion: 0.24
Nodes (6): DASHBOARD_MENU_ITEMS, NAV_GROUPS, NavGroup, NavItem, PURCHASING_MENU_ITEMS, WAREHOUSE_MENU_ITEMS

### Community 22 - "Lint Configuration"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 23 - "Input Group UI"
Cohesion: 0.28
Nodes (4): InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants

### Community 28 - "Favicon Design"
Cohesion: 0.33
Nodes (7): Alpha Mask Clipping Glow to Z Shape, Gaussian Blur Filter Set, App Brand Identity Asset, Z-Mark Glow Favicon, Glow Ellipse Layers, Purple-Blue Color Palette, Z-Shaped Logo Path

### Community 30 - "Docs Content Registry"
Cohesion: 0.29
Nodes (4): DOCS_MENUS, DocsMenu, DocsSubmenu, modules

### Community 33 - "Social Icons"
Cohesion: 1.00
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X (Twitter) Icon

### Community 34 - "Dashboard README"
Cohesion: 0.50
Nodes (4): dashboard README (Vite Template Docs), Oxlint, React Compiler, React + TypeScript + Vite Template

### Community 35 - "Vite Brand Assets"
Cohesion: 0.67
Nodes (4): App Brand Mark (Icon/Favicon), Dark Mode Adaptive Styling, Vite Build Tool, Vite Logo

### Community 38 - "Hero Banner Asset"
Cohesion: 0.67
Nodes (3): Purchasing Dashboard App, Hero Banner UI Element, Hero Image Asset (hero.png)

### Community 39 - "React Logo Assets"
Cohesion: 1.00
Nodes (3): React Framework, React Logo (Atom Mark), React SVG Asset

## Ambiguous Edges - Review These
- `Hero Image Asset (hero.png)` → `Hero Banner UI Element`  [AMBIGUOUS]
  dashboard/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **222 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+217 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Hero Image Asset (hero.png)` and `Hero Banner UI Element`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Theme & Form Controls` to `Shared Dashboard Components`, `App Routing & Pages`, `Analytics & AI Insights`, `Sidebar UI Kit`, `Exports & Reports`, `Dropdown Menu UI`, `Dashboard Landing KPIs`, `Recharts Chart Wrapper`, `Dialog UI`, `Drawer UI`, `Select UI`, `Sheet UI`, `Sidebar Navigation`, `Command UI`, `Lint Configuration`, `Input Group UI`, `Table UI`, `Breadcrumb UI`, `Card UI`, `Popover UI`, `Avatar UI`, `Tabs UI`, `Tooltip UI`, `Toggle Group UI`, `Badge UI`, `Toggle UI`?**
  _High betweenness centrality (0.327) - this node is a cross-community bridge._
- **Why does `AGENTS.md — Project Conventions` connect `Versioning & Data Parsing` to `Shared Dashboard Components`, `App Routing & Pages`, `Exports & Reports`, `Analytics & AI Insights`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `prompt.md — Purchase Dashboard Spec` connect `Versioning & Data Parsing` to `Shared Dashboard Components`, `App Routing & Pages`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _222 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared Dashboard Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05358182877111241 - nodes in this community are weakly interconnected._
- **Should `App Routing & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.054426705370101594 - nodes in this community are weakly interconnected._