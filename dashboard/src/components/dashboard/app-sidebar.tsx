import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import purchaseData from "@/data/purchase-data.json";
import { formatNumber } from "@/utils/formatters";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  ChevronRightIcon,
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
  WarehouseIcon,
  PackageIcon,
  BoxesIcon,
  ArchiveIcon,
  StoreIcon,
  CogIcon,
  MapPinIcon,
  BuildingIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

const PURCHASING_MENU_ITEMS: NavItem[] = [
  { title: "Purchase Summary", url: "/summary", icon: <LayoutDashboardIcon /> },
  {
    title: "Purchasing by Supplier",
    url: "/by-supplier",
    icon: <Building2Icon />,
  },
  { title: "Supplier Ranking", url: "/ranking", icon: <TrophyIcon /> },
  {
    title: "Supplier Quality",
    url: "/quality",
    icon: <ShieldCheckIcon />,
  },
  {
    title: "Supplier Delivery Performance",
    url: "/delivery",
    icon: <TruckIcon />,
  },
  { title: "Supplier Scorecard", url: "/scorecard", icon: <StarIcon /> },
  { title: "Price History", url: "/price-history", icon: <HistoryIcon /> },
  {
    title: "Purchase Variance",
    url: "/variance",
    icon: <TrendingUpIcon />,
  },
  {
    title: "Material Cost Trends",
    url: "/material-cost",
    icon: <FactoryIcon />,
  },
  {
    title: "Price Increase Alert",
    url: "/price-alert",
    icon: <AlertTriangleIcon />,
  },
  { title: "Supplier Lead Time", url: "/lead-time", icon: <TimerIcon /> },
  {
    title: "Outstanding PO",
    url: "/outstanding-po",
    icon: <ClipboardListIcon />,
  },
  { title: "Open PO", url: "/open-po", icon: <FileTextIcon /> },
  {
    title: "Closed PO",
    url: "/closed-po",
    icon: <FolderCheckIcon />,
  },
];

const WAREHOUSE_MENU_ITEMS: NavItem[] = [
  {
    title: "01: GUDANG BAHAN BAKU",
    url: "/warehouse/gudang-bahan-baku",
    icon: <PackageIcon />,
  },
  {
    title: "04: GUDANG BARANG JADI",
    url: "/warehouse/gudang-barang-jadi",
    icon: <BoxesIcon />,
  },
  {
    title: "07: GUDANG SPAREPART",
    url: "/warehouse/gudang-sparepart",
    icon: <ArchiveIcon />,
  },
  {
    title: "09: CBD SPAREPART",
    url: "/warehouse/cbd-sparepart",
    icon: <StoreIcon />,
  },
  { title: "51: GUDANG WIP", url: "/warehouse/gudang-wip", icon: <CogIcon /> },
  {
    title: "54: GUDANG PEKANBARU",
    url: "/warehouse/gudang-pekanbaru",
    icon: <MapPinIcon />,
  },
  {
    title: "24: KANTOR SALES",
    url: "/warehouse/kantor-sales",
    icon: <BuildingIcon />,
  },
];

interface NavGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Purchasing",
    icon: <LayoutDashboardIcon />,
    items: PURCHASING_MENU_ITEMS,
  },
  { title: "Warehouse", icon: <WarehouseIcon />, items: WAREHOUSE_MENU_ITEMS },
];

function CollapsibleMenuGroup({ group }: { group: NavGroup }) {
  const { pathname } = useLocation();
  return (
    <CollapsiblePrimitive.Root
      asChild
      defaultOpen
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsiblePrimitive.Trigger asChild>
          <SidebarMenuButton>
            {group.icon}
            <span>{group.title}</span>
            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content>
          <SidebarMenuSub>
            {group.items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === item.url}
                  className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:[&>svg]:text-sidebar-primary-foreground data-[active=true]:font-medium data-[active=true]:shadow-sm"
                >
                  <NavLink to={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsiblePrimitive.Content>
      </SidebarMenuItem>
    </CollapsiblePrimitive.Root>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  Dashboard Report
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_GROUPS.map((group) => (
                <CollapsibleMenuGroup key={group.title} group={group} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="cursor-default">
              <NavLink to="/summary" className="text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <DatabaseIcon className="size-3.5" />
                  v1.0.0 · {formatNumber(purchaseData.length)} item
                </span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
