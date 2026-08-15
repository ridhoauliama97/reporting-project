import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  Building2Icon,
  TrophyIcon,
  ShieldCheckIcon,
  TruckIcon,
  HistoryIcon,
  TrendingUpIcon,
  FactoryIcon,
  AlertTriangleIcon,
  TimerIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderCheckIcon,
  StarIcon,
  ChartSplineIcon,
  DatabaseIcon,
} from "lucide-react";

const navGroups = [
  {
    label: "Ringkasan",
    items: [
      {
        title: "Ringkasan Pembelian",
        url: "/summary",
        icon: <LayoutDashboardIcon />,
      },
    ],
  },
  {
    label: "Supplier",
    items: [
      {
        title: "Pembelian per Supplier",
        url: "/by-supplier",
        icon: <Building2Icon />,
      },
      { title: "Peringkat Supplier", url: "/ranking", icon: <TrophyIcon /> },
      {
        title: "Kualitas Supplier",
        url: "/quality",
        icon: <ShieldCheckIcon />,
      },
      { title: "Kinerja Pengiriman", url: "/delivery", icon: <TruckIcon /> },
      { title: "Skor Card Supplier", url: "/scorecard", icon: <StarIcon /> },
    ],
  },
  {
    label: "Harga",
    items: [
      { title: "Riwayat Harga", url: "/price-history", icon: <HistoryIcon /> },
      {
        title: "Variance Pembelian",
        url: "/variance",
        icon: <TrendingUpIcon />,
      },
      {
        title: "Tren Biaya Material",
        url: "/material-cost",
        icon: <FactoryIcon />,
      },
      {
        title: "Alert Kenaikan Harga",
        url: "/price-alert",
        icon: <AlertTriangleIcon />,
      },
    ],
  },
  {
    label: "Pengadaan",
    items: [
      { title: "Lead Time Pembelian", url: "/lead-time", icon: <TimerIcon /> },
      {
        title: "PO Outstanding",
        url: "/outstanding-po",
        icon: <ClipboardListIcon />,
      },
      { title: "PO Terbuka", url: "/open-po", icon: <FileTextIcon /> },
      { title: "PO Tertutup", url: "/closed-po", icon: <FolderCheckIcon /> },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <NavLink to="/summary">
                <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <ChartSplineIcon className="size-4!" />
                </div>
                <span className="text-base font-semibold">
                  Dashboard Purchase
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium data-[active=true]:shadow-sm"
                    >
                      <NavLink to={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="cursor-default">
              <NavLink to="/summary" className="text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <DatabaseIcon className="size-3.5" />
                  v1.0.0 · 3.010 item
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
