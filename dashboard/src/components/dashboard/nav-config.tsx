import * as React from "react";
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
  WarehouseIcon,
  PackageIcon,
  BoxesIcon,
  ArchiveIcon,
  StoreIcon,
  CogIcon,
  MapPinIcon,
  BuildingIcon,
  ShoppingCartIcon,
  FileOutputIcon,
  BrainCircuitIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

export const DASHBOARD_MENU_ITEMS: NavItem[] = [
  {
    title: "Statistics Overview",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
];

export const PURCHASING_MENU_ITEMS: NavItem[] = [
  { title: "Purchase Summary", url: "/summary", icon: <FileTextIcon /> },
  {
    title: "Purchase by Supplier",
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
  {
    title: "Purchase Price History",
    url: "/price-history",
    icon: <HistoryIcon />,
  },
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
  {
    title: "Reports & Exports",
    url: "/reports-exports",
    icon: <FileOutputIcon />,
  },
  {
    title: "Analytics & AI Insights",
    url: "/analytics-insights",
    icon: <BrainCircuitIcon />,
  },
];

export const WAREHOUSE_MENU_ITEMS: NavItem[] = [
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

export interface NavGroup {
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
  disabled?: boolean;
  flat?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboardIcon />,
    items: DASHBOARD_MENU_ITEMS,
    flat: true,
  },
  {
    title: "Purchasing",
    icon: <ShoppingCartIcon />,
    items: PURCHASING_MENU_ITEMS,
  },
  {
    title: "Warehouse",
    icon: <WarehouseIcon />,
    items: WAREHOUSE_MENU_ITEMS,
  },
];
