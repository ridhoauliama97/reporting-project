# Graph Report - reporting-project  (2026-08-16)

## Corpus Check
- 77 files · ~89,818 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 512 nodes · 826 edges · 63 communities (31 shown, 32 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core Dashboard Components
- App Shell & Navigation
- Tooling & Data Rules
- Package Dependencies
- Sidebar Components
- App TypeScript Config
- shadcn Component Config
- Node TypeScript Config
- Chart Primitive Components
- Form Control Components
- Oxlint Rules Config
- App Sidebar Navigation
- Runtime UI Dependencies
- Favicon Glow Design
- Tabs Components
- Section Cards
- Social Brand Icons
- Vite Brand Assets
- Toggle Group Components
- Hero Banner Asset
- React Brand Assets
- Site Header
- Badge Components
- Button Components
- Toggle Components
- TypeScript Project Refs
- clsx Utility
- App Entry Point
- date-fns Dependency
- dnd-kit Core Dependency
- dnd-kit Modifiers Dependency
- dnd-kit Sortable Dependency
- dnd-kit Utilities Dependency
- Geist Font Dependency
- Geist Mono Font Dependency
- jspdf Dependency
- jspdf-autotable Dependency
- next-themes Dependency
- radix-ui Dependency
- react Dependency
- react-router-dom Dependency
- recharts Dependency
- sonner Dependency
- tailwind-merge Dependency
- tailwindcss-animate Dependency
- tanstack-table Dependency
- vaul Dependency
- xlsx Dependency
- zod Dependency
- Docs & Social Icons

## God Nodes (most connected - your core abstractions)
1. `react` - 41 edges
2. `Full Build Spec (14 Pages)` - 24 edges
3. `ParsedPurchaseItem` - 23 edges
4. `compilerOptions` - 21 edges
5. `AGENTS.md Agent Guidelines` - 20 edges
6. `README.md Project Documentation` - 17 edges
7. `PageLayout()` - 16 edges
8. `Responsive Polish Spec` - 16 edges
9. `formatRupiah()` - 15 edges
10. `formatNumber()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Full Build Spec (14 Pages)` --semantically_similar_to--> `Responsive Polish Spec`  [INFERRED] [semantically similar]
  prompt.md → polish.md
- `UI Conventions` --references--> `filterByDateRange()`  [EXTRACTED]
  AGENTS.md → dashboard/src/utils/formatters.ts
- `Data Handling Rules (String Numerics, >0 Guards)` --references--> `parseAllItems()`  [EXTRACTED]
  AGENTS.md → dashboard/src/utils/formatters.ts
- `purchase-data.json Dataset` --shares_data_with--> `parseAllItems()`  [EXTRACTED]
  prompt.md → dashboard/src/utils/formatters.ts
- `README.md Project Documentation` --references--> `parseAllItems()`  [EXTRACTED]
  README.md → dashboard/src/utils/formatters.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Purchasing Sidebar Group (14 Pages)** — dashboard_src_pages_purchasesummary, dashboard_src_pages_purchasebysupplier, dashboard_src_pages_supplierranking, dashboard_src_pages_supplierquality, dashboard_src_pages_supplierdelivery, dashboard_src_pages_purchasepricehistory, dashboard_src_pages_purchasevariance, dashboard_src_pages_materialcosttrend, dashboard_src_pages_priceincreasealert, dashboard_src_pages_purchaseleadtime, dashboard_src_pages_outstandingpo, dashboard_src_pages_openpo, dashboard_src_pages_closedpo, dashboard_src_pages_supplierscorecard [EXTRACTED 1.00]
- **Placeholder Pages Group (EmptyState)** — dashboard_src_pages_supplierquality, dashboard_src_pages_outstandingpo, dashboard_src_pages_openpo, dashboard_src_pages_closedpo, dashboard_src_components_emptystate, agents_placeholder_policy [EXTRACTED 1.00]
- **Proxy Metric Pages with InfoBanner** — dashboard_src_pages_supplierdelivery, dashboard_src_pages_supplierscorecard, dashboard_src_pages_purchaseleadtime, dashboard_src_components_infobanner [INFERRED 0.85]
- **Glow Effect Composition** — dashboard_public_favicon_z_path, dashboard_public_favicon_glow_ellipses, dashboard_public_favicon_alpha_mask, dashboard_public_favicon_blur_filters [EXTRACTED 1.00]
- **Brand Logo Icons Set** — dashboard_public_icons_bluesky_icon, dashboard_public_icons_discord_icon, dashboard_public_icons_github_icon, dashboard_public_icons_x_icon [INFERRED 0.85]
- **Icons Form SVG Sprite** — dashboard_public_icons_bluesky_icon, dashboard_public_icons_discord_icon, dashboard_public_icons_documentation_icon, dashboard_public_icons_github_icon, dashboard_public_icons_social_icon, dashboard_public_icons_x_icon [EXTRACTED 1.00]
- **Vite Visual Identity System** — dashboard_src_assets_vite_vitelogo, dashboard_src_assets_vite_vitebuildtool, dashboard_src_assets_vite_darkmode [INFERRED 0.65]

## Communities (63 total, 32 thin omitted)

### Community 0 - "Core Dashboard Components"
Cohesion: 0.07
Nodes (65): AGENTS.md Agent Guidelines, UI Conventions, ChartCard(), ChartCardProps, Column, ColumnGroup, DataTable(), DataTableProps (+57 more)

### Community 1 - "App Shell & Navigation"
Cohesion: 0.12
Nodes (22): Placeholder Pages Policy (No Fabricated Data), App(), getDefaultDateRange(), WAREHOUSES, DateFilter(), DateFilterProps, DateRange, EmptyState() (+14 more)

### Community 2 - "Tooling & Data Rules"
Cohesion: 0.11
Nodes (27): CI Workflow, Lint & Build Job, Data Handling Rules (String Numerics, >0 Guards), Purchasing Dashboard, TypeScript Configuration Gotchas, dashboard README (Vite Template Docs), Oxlint, React Compiler (+19 more)

### Community 3 - "Package Dependencies"
Cohesion: 0.07
Nodes (28): devDependencies, oxlint, tailwindcss, @tailwindcss/vite, @types/node, @types/react, @types/react-dom, typescript (+20 more)

### Community 4 - "Sidebar Components"
Cohesion: 0.08
Nodes (8): Sidebar(), SidebarContext, SidebarContextProps, SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger(), useSidebar()

### Community 5 - "App TypeScript Config"
Cohesion: 0.07
Nodes (26): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+18 more)

### Community 6 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "Node TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 9 - "Chart Primitive Components"
Cohesion: 0.21
Nodes (10): ChartConfig, ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, THEMES (+2 more)

### Community 14 - "Oxlint Rules Config"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 16 - "App Sidebar Navigation"
Cohesion: 0.25
Nodes (5): NAV_GROUPS, NavGroup, NavItem, PURCHASING_MENU_ITEMS, WAREHOUSE_MENU_ITEMS

### Community 19 - "Runtime UI Dependencies"
Cohesion: 0.29
Nodes (7): class-variance-authority, dependencies, class-variance-authority, lucide-react, react-dom, lucide-react, react-dom

### Community 20 - "Favicon Glow Design"
Cohesion: 0.33
Nodes (7): Alpha Mask Clipping Glow to Z Shape, Gaussian Blur Filter Set, App Brand Identity Asset, Z-Mark Glow Favicon, Glow Ellipse Layers, Purple-Blue Color Palette, Z-Shaped Logo Path

### Community 23 - "Section Cards"
Cohesion: 0.50
Nodes (3): pctChange(), SectionCards(), SectionCardsProps

### Community 25 - "Social Brand Icons"
Cohesion: 1.00
Nodes (4): Bluesky Icon, Discord Icon, GitHub Icon, X (Twitter) Icon

### Community 26 - "Vite Brand Assets"
Cohesion: 0.67
Nodes (4): App Brand Mark (Icon/Favicon), Dark Mode Adaptive Styling, Vite Build Tool, Vite Logo

### Community 28 - "Hero Banner Asset"
Cohesion: 0.67
Nodes (3): Purchasing Dashboard App, Hero Banner UI Element, Hero Image Asset (hero.png)

### Community 29 - "React Brand Assets"
Cohesion: 1.00
Nodes (3): React Framework, React Logo (Atom Mark), React SVG Asset

## Ambiguous Edges - Review These
- `Hero Image Asset (hero.png)` → `Hero Banner UI Element`  [AMBIGUOUS]
  dashboard/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **169 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+164 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Hero Image Asset (hero.png)` and `Hero Banner UI Element`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Form Control Components` to `Core Dashboard Components`, `App Shell & Navigation`, `Tooling & Data Rules`, `Sidebar Components`, `Dropdown Menu Components`, `Chart Primitive Components`, `Drawer Components`, `Select Components`, `Sheet Components`, `Oxlint Rules Config`, `Table Primitive Components`, `App Sidebar Navigation`, `Breadcrumb Components`, `Card Components`, `Avatar Components`, `Tabs Components`, `Tooltip Components`, `Toggle Group Components`, `Badge Components`, `Button Components`, `Toggle Components`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime UI Dependencies` to `Package Dependencies`, `clsx Utility`, `date-fns Dependency`, `dnd-kit Core Dependency`, `dnd-kit Modifiers Dependency`, `dnd-kit Sortable Dependency`, `dnd-kit Utilities Dependency`, `Geist Font Dependency`, `Geist Mono Font Dependency`, `jspdf Dependency`, `jspdf-autotable Dependency`, `next-themes Dependency`, `radix-ui Dependency`, `react Dependency`, `react-router-dom Dependency`, `recharts Dependency`, `sonner Dependency`, `tailwind-merge Dependency`, `tailwindcss-animate Dependency`, `tanstack-table Dependency`, `vaul Dependency`, `xlsx Dependency`, `zod Dependency`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `plugins` connect `Oxlint Rules Config` to `Form Control Components`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _169 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Dashboard Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07437518819632641 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.11931818181818182 - nodes in this community are weakly interconnected._