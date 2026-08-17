import { BookOpenIcon, ShoppingCartIcon } from "lucide-react";

export interface DocsSubmenu {
  title: string;
  slug: string;
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
      { title: "Tentang Aplikasi", slug: "overview" },
      { title: "Istilah & Definisi", slug: "glossary" },
    ],
  },
  {
    title: "Purchasing",
    slug: "purchasing",
    icon: <ShoppingCartIcon />,
    submenus: [
      { title: "Purchase Summary", slug: "purchase-summary" },
      { title: "Purchase By Supplier", slug: "purchase-by-supplier" },
      { title: "Supplier Ranking", slug: "supplier-ranking" },
      { title: "Supplier Quality", slug: "supplier-quality" },
      { title: "Supplier Delivery Performance", slug: "supplier-delivery" },
      { title: "Purchase Price History", slug: "purchase-price-history" },
      { title: "Purchase Variance", slug: "purchase-variance" },
      { title: "Material Cost Trend", slug: "material-cost-trend" },
      { title: "Price Increase Alert", slug: "price-increase-alert" },
      { title: "Purchase Lead Time", slug: "purchase-lead-time" },
      { title: "Outstanding PO", slug: "outstanding-po" },
      { title: "Open PO", slug: "open-po" },
      { title: "Closed PO", slug: "closed-po" },
      { title: "Supplier Scorecard", slug: "supplier-scorecard" },
      { title: "Reports & Exports", slug: "reports-exports" },
      { title: "Analytics & AI Insights", slug: "analytics-insights" },
    ],
  },
];

export function getDocContent(menuSlug: string, slug: string): string {
  return modules[`./${menuSlug}/${slug}.md`] ?? "";
}

export function resolveDoc(
  path: string | null
): { menuSlug: string; slug: string } {
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