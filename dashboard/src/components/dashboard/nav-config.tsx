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
    title: "Inventory Value",
    url: "/warehouse/inventory-value",
    icon: <CoinsIcon />,
  },
  {
    title: "Stock Movement",
    url: "/warehouse/stock-movement",
    icon: <ArrowLeftRightIcon />,
  },
  {
    title: "Dead Stock",
    url: "/warehouse/dead-stock",
    icon: <PackageXIcon />,
  },
  {
    title: "Slow Moving",
    url: "/warehouse/slow-moving",
    icon: <GaugeIcon />,
  },
  {
    title: "Fast Moving",
    url: "/warehouse/fast-moving",
    icon: <ZapIcon />,
  },
  {
    title: "Inventory Aging",
    url: "/warehouse/inventory-aging",
    icon: <CalendarClockIcon />,
  },
  {
    title: "Cycle Count Accuracy",
    url: "/warehouse/cycle-count-accuracy",
    icon: <ListChecksIcon />,
  },
  {
    title: "Stock Adjustment",
    url: "/warehouse/stock-adjustment",
    icon: <SlidersHorizontalIcon />,
  },
  {
    title: "Warehouse Productivity",
    url: "/warehouse/warehouse-productivity",
    icon: <WorkflowIcon />,
  },
  {
    title: "Warehouse Utilization",
    url: "/warehouse/warehouse-utilization",
    icon: <PieChartIcon />,
  },
  {
    title: "Location Occupancy",
    url: "/warehouse/location-occupancy",
    icon: <Grid3x3Icon />,
  },
  {
    title: "Transfer History",
    url: "/warehouse/transfer-history",
    icon: <MoveRightIcon />,
  },
  {
    title: "Stock Availability",
    url: "/warehouse/stock-availability",
    icon: <PackageCheckIcon />,
  },
  {
    title: "Fill Rate",
    url: "/warehouse/fill-rate",
    icon: <PercentIcon />,
  },
  {
    title: "Picking Accuracy",
    url: "/warehouse/picking-accuracy",
    icon: <TargetIcon />,
  },
  {
    title: "Packing Accuracy",
    url: "/warehouse/packing-accuracy",
    icon: <PackageIcon />,
  },
  {
    title: "Delivery Performance",
    url: "/warehouse/delivery-performance",
    icon: <TruckIcon />,
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
