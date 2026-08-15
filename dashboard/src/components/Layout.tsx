import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';

const PAGE_TITLES: Record<string, string> = {
  '/summary': 'Ringkasan Pembelian',
  '/by-supplier': 'Pembelian per Supplier',
  '/ranking': 'Peringkat Supplier',
  '/quality': 'Kualitas Supplier',
  '/delivery': 'Kinerja Pengiriman',
  '/price-history': 'Riwayat Harga',
  '/variance': 'Variance Pembelian',
  '/material-cost': 'Tren Biaya Material',
  '/price-alert': 'Alert Kenaikan Harga',
  '/lead-time': 'Lead Time Pembelian',
  '/outstanding-po': 'PO Outstanding',
  '/open-po': 'PO Terbuka',
  '/closed-po': 'PO Tertutup',
  '/scorecard': 'Skor Card Supplier',
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'Dashboard Purchase';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title={title} />
        <main className="flex flex-1 flex-col">
          <div
            key={pathname}
            className="@container/main animate-in fade-in slide-in-from-bottom-1 duration-300 flex flex-1 flex-col gap-4 p-4 md:p-6"
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}