import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartSplineIcon, ChevronRightIcon, SearchIcon } from "lucide-react";
import {
  DOCS_MENUS,
  getDocContent,
  resolveDoc,
  type DocsSubmenu,
} from "@/docs-content";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";

function SubmenuButton({
  sub,
  active,
  onClick,
}: {
  sub: DocsSubmenu;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        active
          ? "bg-primary font-medium text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      <span className="shrink-0 opacity-70">{sub.icon}</span>
      <span className="truncate">{sub.title}</span>
    </button>
  );
}

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = useMemo(
    () => resolveDoc(searchParams.get("doc")),
    [searchParams],
  );
  const content = useMemo(
    () => getDocContent(active.menuSlug, active.slug),
    [active],
  );
  const activeTitle = useMemo(() => {
    const menu = DOCS_MENUS.find((m) => m.slug === active.menuSlug);
    const sub = menu?.submenus.find((s) => s.slug === active.slug);
    return { menuTitle: menu?.title ?? "", subTitle: sub?.title ?? "" };
  }, [active]);

  const [query, setQuery] = useState("");
  const [openMenus, setOpenMenus] = useState<Set<string>>(
    () => new Set(DOCS_MENUS.map((m) => m.slug)),
  );

  const q = query.trim().toLowerCase();
  const filteredMenus = useMemo(() => {
    if (!q) {
      return DOCS_MENUS.map((menu) => ({ menu, submenus: menu.submenus }));
    }
    return DOCS_MENUS.map((menu) => ({
      menu,
      submenus: menu.submenus.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          menu.title.toLowerCase().includes(q),
      ),
    })).filter((entry) => entry.submenus.length > 0);
  }, [q]);

  const selectDoc = (menuSlug: string, slug: string) => {
    setSearchParams({ doc: `${menuSlug}/${slug}` });
  };

  const toggleMenu = (menuSlug: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuSlug)) {
        next.delete(menuSlug);
      } else {
        next.add(menuSlug);
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6">
          <a
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
            title="Kembali ke Dashboard"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <ChartSplineIcon className="size-4!" />
            </div>
            <span className="hidden sm:inline">Database Report</span>
            {/* <span className="hidden text-muted-foreground sm:inline">/</span> */}
            {/* <span className="hidden sm:inline">Documentation</span> */}
          </a>
          <select
            aria-label="Pilih dokumen"
            className="block min-w-0 flex-1 truncate rounded-md border bg-transparent px-2 py-1.5 text-sm md:hidden"
            value={`${active.menuSlug}/${active.slug}`}
            onChange={(e) => {
              const [m, s] = e.target.value.split("/");
              selectDoc(m, s);
            }}
          >
            {DOCS_MENUS.map((menu) => (
              <optgroup key={menu.slug} label={menu.title}>
                {menu.submenus.map((sub) => (
                  <option key={sub.slug} value={`${menu.slug}/${sub.slug}`}>
                    {sub.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-1">
            {/* <a
              href="/dashboard"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              Kembali ke Dashboard
            </a> */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-72 shrink-0 flex-col border-r md:flex">
          <div className="border-b p-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari dokumen..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
                aria-label="Cari dokumen"
              />
            </div>
          </div>
          <nav
            className="flex-1 overflow-y-auto p-2"
            aria-label="Daftar dokumen"
          >
            {filteredMenus.map(({ menu, submenus }) => {
              const open = q ? true : openMenus.has(menu.slug);
              return (
                <div key={menu.slug} className="mb-1">
                  <button
                    type="button"
                    onClick={() => toggleMenu(menu.slug)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="shrink-0 text-muted-foreground">
                      {menu.icon}
                    </span>
                    <span className="truncate">{menu.title}</span>
                    <ChevronRightIcon
                      className={`ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="ml-2 mt-1 space-y-0.5 border-l pl-2">
                      {submenus.map((sub) => (
                        <SubmenuButton
                          key={sub.slug}
                          sub={sub}
                          active={
                            active.menuSlug === menu.slug &&
                            active.slug === sub.slug
                          }
                          onClick={() => selectDoc(menu.slug, sub.slug)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredMenus.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Tidak ada hasil untuk &quot;{query}&quot;
              </p>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
            <p className="mb-4 text-xs uppercase tracking-wide text-muted-foreground">
              {activeTitle.menuTitle} / {activeTitle.subTitle}
            </p>
            <article className="docs-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
