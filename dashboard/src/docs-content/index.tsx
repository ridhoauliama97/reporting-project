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
    title: "Statistics Overview",
    slug: "statistics-overview",
    icon: <LayoutDashboardIcon />,
    submenus: [{ title: "Dashboard", slug: "dashboard", icon: <LayoutDashboardIcon /> }],
  },
  {
    title: "Purchasing",
    slug: "purchasing",
    icon: <ShoppingCartIcon />,
    submenus: [
      { title: "Purchase Summary", slug: "purchase-summary", icon: <FileTextIcon /> },
      { title: "Purchase by Supplier", slug: "purchase-by-supplier", icon: <Building2Icon /> },
      { title: "Supplier Ranking", slug: "supplier-ranking", icon: <TrophyIcon /> },
      { title: "Supplier Quality", slug: "supplier-quality", icon: <ShieldCheckIcon /> },
      { title: "Supplier Delivery Performance", slug: "supplier-delivery", icon: <TruckIcon /> },
      { title: "Supplier Scorecard", slug: "supplier-scorecard", icon: <StarIcon /> },
      { title: "Purchase Price History", slug: "purchase-price-history", icon: <HistoryIcon /> },
      { title: "Purchase Variance", slug: "purchase-variance", icon: <TrendingUpIcon /> },
      { title: "Material Cost Trends", slug: "material-cost-trend", icon: <FactoryIcon /> },
      { title: "Price Increase Alert", slug: "price-increase-alert", icon: <AlertTriangleIcon /> },
      { title: "Supplier Lead Time", slug: "purchase-lead-time", icon: <TimerIcon /> },
      { title: "Outstanding PO", slug: "outstanding-po", icon: <ClipboardListIcon /> },
      { title: "Open PO", slug: "open-po", icon: <FileTextIcon /> },
      { title: "Closed PO", slug: "closed-po", icon: <FolderCheckIcon /> },
      { title: "Reports & Exports", slug: "reports-exports", icon: <FileOutputIcon /> },
      { title: "Analytics & AI Insights", slug: "analytics-insights", icon: <BrainCircuitIcon /> },
    ],
  },
  {
    title: "Overview",
    slug: "overview",
    icon: <BookOpenIcon />,
    submenus: [
      { title: "Tentang Aplikasi", slug: "overview", icon: <BookOpenIcon /> },
      { title: "Istilah & Definisi", slug: "glossary", icon: <BookTextIcon /> },
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
