import {
  BookOpenIcon,
  BookTextIcon,
  ShoppingCartIcon,
  LayoutDashboardIcon,
  FileTextIcon,
  Building2Icon,
  TrophyIcon,
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  HistoryIcon,
  TrendingUpIcon,
  FactoryIcon,
  AlertTriangleIcon,
  TimerIcon,
  ClipboardListIcon,
  FolderCheckIcon,
  FileOutputIcon,
  BrainCircuitIcon,
  WarehouseIcon,
  CoinsIcon,
  ArrowLeftRightIcon,
  PackageXIcon,
  GaugeIcon,
  ZapIcon,
  CalendarClockIcon,
  ListChecksIcon,
  SlidersHorizontalIcon,
  WorkflowIcon,
  PieChartIcon,
  Grid3x3Icon,
  MoveRightIcon,
  PackageCheckIcon,
  PercentIcon,
  TargetIcon,
  PackageIcon,
} from "lucide-react";

export interface DocsSubmenu {
  title: string;
  slug: string;
  icon: React.ReactNode;
}

export interface DocsMenu {
  title: string;
  slug: string;
  icon: React.ReactNode;
  submenus: DocsSubmenu[];
}

const modules = import.meta.glob("./**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const DOCS_MENUS: DocsMenu[] = [
  {
    title: "Overview",
    slug: "overview",
    icon: <BookOpenIcon />,
    submenus: [
      { title: "Tentang Aplikasi", slug: "overview", icon: <BookOpenIcon /> },
      { title: "Istilah & Definisi", slug: "glossary", icon: <BookTextIcon /> },
    ],
  },
  {
    title: "Dashboard",
    slug: "dashboard",
    icon: <LayoutDashboardIcon />,
    submenus: [
      {
        title: "Statistics Overview",
        slug: "statistics-overview",
        icon: <LayoutDashboardIcon />,
      },
    ],
  },
  {
    title: "Purchasing",
    slug: "purchasing",
    icon: <ShoppingCartIcon />,
    submenus: [
      {
        title: "Purchase Summary",
        slug: "purchase-summary",
        icon: <FileTextIcon />,
      },
      {
        title: "Purchase by Supplier",
        slug: "purchase-by-supplier",
        icon: <Building2Icon />,
      },
      {
        title: "Supplier Ranking",
        slug: "supplier-ranking",
        icon: <TrophyIcon />,
      },
      {
        title: "Supplier Quality",
        slug: "supplier-quality",
        icon: <ShieldCheckIcon />,
      },
      {
        title: "Supplier Delivery Performance",
        slug: "supplier-delivery",
        icon: <TruckIcon />,
      },
      {
        title: "Supplier Scorecard",
        slug: "supplier-scorecard",
        icon: <StarIcon />,
      },
      {
        title: "Purchase Price History",
        slug: "purchase-price-history",
        icon: <HistoryIcon />,
      },
      {
        title: "Purchase Variance",
        slug: "purchase-variance",
        icon: <TrendingUpIcon />,
      },
      {
        title: "Material Cost Trends",
        slug: "material-cost-trend",
        icon: <FactoryIcon />,
      },
      {
        title: "Price Increase Alert",
        slug: "price-increase-alert",
        icon: <AlertTriangleIcon />,
      },
      {
        title: "Supplier Lead Time",
        slug: "purchase-lead-time",
        icon: <TimerIcon />,
      },
      {
        title: "Outstanding PO",
        slug: "outstanding-po",
        icon: <ClipboardListIcon />,
      },
      {
        title: "Open PO",
        slug: "open-po",
        icon: <FileTextIcon />,
      },
      {
        title: "Closed PO",
        slug: "closed-po",
        icon: <FolderCheckIcon />,
      },
      {
        title: "Reports & Exports",
        slug: "reports-exports",
        icon: <FileOutputIcon />,
      },
      {
        title: "Analytics & AI Insights",
        slug: "analytics-insights",
        icon: <BrainCircuitIcon />,
      },
    ],
  },
  {
    title: "Warehouse",
    slug: "warehouse",
    icon: <WarehouseIcon />,
    submenus: [
      {
        title: "Inventory Value",
        slug: "inventory-value",
        icon: <CoinsIcon />,
      },
      {
        title: "Stock Movement",
        slug: "stock-movement",
        icon: <ArrowLeftRightIcon />,
      },
      {
        title: "Dead Stock",
        slug: "dead-stock",
        icon: <PackageXIcon />,
      },
      {
        title: "Slow Moving",
        slug: "slow-moving",
        icon: <GaugeIcon />,
      },
      {
        title: "Fast Moving",
        slug: "fast-moving",
        icon: <ZapIcon />,
      },
      {
        title: "Inventory Aging",
        slug: "inventory-aging",
        icon: <CalendarClockIcon />,
      },
      {
        title: "Cycle Count Accuracy",
        slug: "cycle-count-accuracy",
        icon: <ListChecksIcon />,
      },
      {
        title: "Stock Adjustment",
        slug: "stock-adjustment",
        icon: <SlidersHorizontalIcon />,
      },
      {
        title: "Warehouse Productivity",
        slug: "warehouse-productivity",
        icon: <WorkflowIcon />,
      },
      {
        title: "Warehouse Utilization",
        slug: "warehouse-utilization",
        icon: <PieChartIcon />,
      },
      {
        title: "Location Occupancy",
        slug: "location-occupancy",
        icon: <Grid3x3Icon />,
      },
      {
        title: "Transfer History",
        slug: "transfer-history",
        icon: <MoveRightIcon />,
      },
      {
        title: "Stock Availability",
        slug: "stock-availability",
        icon: <PackageCheckIcon />,
      },
      {
        title: "Fill Rate",
        slug: "fill-rate",
        icon: <PercentIcon />,
      },
      {
        title: "Picking Accuracy",
        slug: "picking-accuracy",
        icon: <TargetIcon />,
      },
      {
        title: "Packing Accuracy",
        slug: "packing-accuracy",
        icon: <PackageIcon />,
      },
      {
        title: "Delivery Performance",
        slug: "delivery-performance",
        icon: <TruckIcon />,
      },
    ],
  },
];

export function getDocContent(menuSlug: string, slug: string): string {
  return modules[`./${menuSlug}/${slug}.md`] ?? "";
}

export function resolveDoc(path: string | null): {
  menuSlug: string;
  slug: string;
} {
  if (path) {
    const [menuSlug, slug] = path.split("/");
    const menu = DOCS_MENUS.find((m) => m.slug === menuSlug);
    const submenu = menu?.submenus.find((s) => s.slug === slug);
    if (menu && submenu) {
      return { menuSlug: menu.slug, slug: submenu.slug };
    }
  }
  const first = DOCS_MENUS[0];
  return { menuSlug: first.slug, slug: first.submenus[0].slug };
}
