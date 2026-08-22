import { SearchIcon, BellIcon } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ThemeToggle from "@/components/ThemeToggle";

interface BreadcrumbEntry {
  group: string;
  item: string;
}

interface SiteHeaderProps {
  title: string;
  breadcrumb?: BreadcrumbEntry | null;
}

export function SiteHeader({ title, breadcrumb }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 shrink-0 data-[orientation=vertical]:h-4"
        />
        {breadcrumb ? (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="hidden shrink-0 md:flex">
                <span className="text-sm font-medium text-muted-foreground">
                  {breadcrumb.group}
                </span>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden shrink-0 md:block" />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate text-base font-medium">
                  {breadcrumb.item}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="min-w-0 truncate text-base font-medium">{title}</h1>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:gap-2">
          <div className="relative hidden md:block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari..."
              className="w-44 rounded-lg bg-muted pl-8 transition-all focus-visible:w-64 lg:w-64 lg:focus-visible:w-80"
            />
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifikasi"
          >
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
