import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";

const PAGE_TITLES: Record<string, string> = {
  "/summary": "Purchase Summary",
  "/by-supplier": "Purchasing by Supplier",
  "/ranking": "Supplier Ranking",
  "/quality": "Supplier Quality",
  "/delivery": "Supplier Delivery Performance",
  "/price-history": "Price History",
  "/variance": "Purchase Variance",
  "/material-cost": "Material Cost Trends",
  "/price-alert": "Price Increase Alert",
  "/lead-time": "Supplier Lead Time",
  "/outstanding-po": "Outstanding Purchase Orders",
  "/open-po": "Open Purchase Orders",
  "/closed-po": "Closed Purchase Orders",
  "/scorecard": "Supplier Scorecard",
  "/warehouse/gudang-bahan-baku": "01: GUDANG BAHAN BAKU",
  "/warehouse/gudang-barang-jadi": "04: GUDANG BARANG JADI",
  "/warehouse/gudang-sparepart": "07: GUDANG SPAREPART",
  "/warehouse/cbd-sparepart": "09: CBD SPAREPART",
  "/warehouse/gudang-wip": "51: GUDANG WIP",
  "/warehouse/gudang-pekanbaru": "54: GUDANG PEKANBARU",
  "/warehouse/kantor-sales": "24: KANTOR SALES",
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Dashboard Purchase";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title={title} />
        <main className="flex flex-1 flex-col">
          <div
            key={pathname}
            className="@container/main animate-in fade-in slide-in-from-bottom-1 duration-300 flex flex-1 flex-col gap-3 p-4 md:gap-4 md:p-6"
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
