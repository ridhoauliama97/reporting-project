import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatDate,
  formatPercent,
  warehouseFull,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";

interface WarehouseUtilizationProps {
  stock: ParsedStockRecord[];
}

interface WarehouseUtilRow {
  warehouse: string;
  registeredLocations: number;
  occupiedLocations: number;
  utilizationPct: number;
  locatedItems: number;
  itemsWithoutLocation: number;
}

export default function WarehouseUtilization({
  stock,
}: WarehouseUtilizationProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const warehouseRows = useMemo(() => {
    const grouped: Record<string, WarehouseUtilRow> = {};
    stock.forEach((s) => {
      const wh = warehouseFull(s.warehouseCode, s.warehouseName);
      if (!grouped[wh]) {
        grouped[wh] = {
          warehouse: wh,
          registeredLocations: 0,
          occupiedLocations: 0,
          utilizationPct: 0,
          locatedItems: 0,
          itemsWithoutLocation: 0,
        };
      }
      const g = grouped[wh];
      if (s.shelfCode && s.shelfCode.trim() !== "") {
        if (s.onHand > 0) {
          g.registeredLocations += 1;
          g.occupiedLocations += 1;
          g.locatedItems += 1;
        }
      } else {
        g.itemsWithoutLocation += 1;
      }
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        utilizationPct:
          g.registeredLocations > 0
            ? Math.round((g.occupiedLocations / g.registeredLocations) * 1000) /
              10
            : 0,
      }))
      .sort((a, b) => b.occupiedLocations - a.occupiedLocations);
  }, [stock]);

  const totalRegistered = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.registeredLocations, 0),
    [warehouseRows],
  );
  const totalOccupied = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.occupiedLocations, 0),
    [warehouseRows],
  );
  const totalLocatedItems = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.locatedItems, 0),
    [warehouseRows],
  );
  const totalWithoutLocation = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.itemsWithoutLocation, 0),
    [warehouseRows],
  );
  const utilizationPct =
    totalRegistered > 0
      ? Math.round((totalOccupied / totalRegistered) * 1000) / 10
      : 0;
  const topWarehouse = warehouseRows[0];

  const chartData = useMemo(
    () =>
      warehouseRows.slice(0, 10).map((g) => ({
        name:
          g.warehouse.length > (isMobile ? 13 : 20)
            ? g.warehouse.substring(0, isMobile ? 13 : 20) + "..."
            : g.warehouse,
        total: g.occupiedLocations,
      })),
    [warehouseRows, isMobile],
  );

  const columns = [
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "registeredLocations",
      label: "Lokasi Terdaftar",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "occupiedLocations",
      label: "Lokasi Terisi",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "utilizationPct",
      label: "Utilisasi",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseUtilRow) => formatPercent(g.utilizationPct),
    },
    {
      key: "locatedItems",
      label: "Item Berlokasi",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "itemsWithoutLocation",
      label: "Item Tanpa Lokasi",
      align: "right" as const,
      sortable: true,
    },
  ];

  return (
    <PageLayout
      title="Warehouse Utilization"
      subtitle="Tingkat pemanfaatan lokasi/rak penyimpanan per gudang."
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Utilisasi dihitung dari
        lokasi (shelf code) yang berisi stok dibanding seluruh lokasi terdaftar
        per gudang — bukan kapasitas fisik rak. Item stok tanpa shelf code
        dicatat sebagai "Tanpa Lokasi".
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisasi Lokasi"
          value={formatPercent(utilizationPct)}
        />
        <StatCard
          title="Lokasi Terisi"
          value={`${formatNumber(totalOccupied)} / ${formatNumber(totalRegistered)}`}
        />
        <StatCard
          title="Item Berlokasi"
          value={formatNumber(totalLocatedItems)}
        />
        <StatCard
          title="Item Tanpa Lokasi"
          value={formatNumber(totalWithoutLocation)}
          subtitle={
            topWarehouse
              ? `${topWarehouse.warehouse}: ${formatNumber(topWarehouse.occupiedLocations)} lokasi terisi`
              : undefined
          }
          accent
        />
      </div>

      <ChartCard
        title="Lokasi Terisi per Gudang (10 Teratas)"
        description="Jumlah shelf location berisi stok per gudang"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Lokasi Terisi"
          tooltipFormatter={formatNumber}
          yWidthMobile={100}
          yWidthDesktop={150}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={warehouseRows}
        searchable
        searchFields={["warehouse"]}
        showExport
        showColumnToggle
        title="warehouse-utilization"
        totalColumns={[
          "registeredLocations",
          "occupiedLocations",
          "locatedItems",
          "itemsWithoutLocation",
        ]}
      />
    </PageLayout>
  );
}