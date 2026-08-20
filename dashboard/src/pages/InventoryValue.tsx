import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
  formatDate,
  warehouseFull,
  round1,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";

interface InventoryValueProps {
  stock: ParsedStockRecord[];
}

interface WarehouseGroup {
  warehouse: string;
  itemCount: number;
  totalQty: number;
  totalValue: number;
}

export default function InventoryValue({ stock }: InventoryValueProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const warehouseGroups = useMemo(() => {
    const grouped: Record<string, WarehouseGroup> = {};
    stock.forEach((s) => {
      const key = warehouseFull(s.warehouseCode, s.warehouseName);
      if (!grouped[key]) {
        grouped[key] = {
          warehouse: key,
          itemCount: 0,
          totalQty: 0,
          totalValue: 0,
        };
      }
      const value = s.onHand * s.lastPurchaseCost;
      grouped[key].itemCount += 1;
      grouped[key].totalQty += s.onHand;
      grouped[key].totalValue += value;
    });
    return Object.values(grouped).sort((a, b) => b.totalValue - a.totalValue);
  }, [stock]);

  const totalValue = useMemo(
    () => warehouseGroups.reduce((sum, g) => sum + g.totalValue, 0),
    [warehouseGroups],
  );
  const totalQty = useMemo(
    () => warehouseGroups.reduce((sum, g) => sum + g.totalQty, 0),
    [warehouseGroups],
  );
  const totalItems = useMemo(
    () => stock.filter((s) => s.onHand > 0).length,
    [stock],
  );
  const topWarehouse = warehouseGroups[0];

  const chartData = useMemo(
    () =>
      warehouseGroups.slice(0, 10).map((g) => ({
        name:
          g.warehouse.length > (isMobile ? 13 : 20)
            ? g.warehouse.substring(0, isMobile ? 13 : 20) + "..."
            : g.warehouse,
        total: round1(g.totalValue),
      })),
    [warehouseGroups, isMobile],
  );

  const columns = [
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "itemCount",
      label: "Jumlah Item",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "totalQty",
      label: "Total On-Hand",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseGroup) => formatNumber(g.totalQty),
    },
    {
      key: "totalValue",
      label: "Nilai Persediaan",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseGroup) => formatRupiah(g.totalValue),
    },
  ];

  return (
    <PageLayout
      title="Inventory Value"
      subtitle="Nilai persediaan (on-hand × harga beli terakhir) per gudang."
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Nilai dihitung dari on-hand dikali harga beli
        terakhir (last purchase cost).
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Nilai Persediaan"
          value={formatRupiah(totalValue)}
        />
        <StatCard title="Total On-Hand" value={formatNumber(totalQty)} />
        <StatCard title="Jumlah Item" value={formatNumber(totalItems)} />
        <StatCard
          title="Gudang Terbesar"
          value={formatRupiah(topWarehouse?.totalValue ?? 0)}
          subtitle={topWarehouse?.warehouse}
          accent
        />
      </div>

      <ChartCard
        title="Nilai Persediaan per Gudang (10 Terbesar)"
        description="Gudang dengan nilai persediaan tertinggi"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Nilai Persediaan"
          tickFormatter={formatRupiahCompact}
          tooltipFormatter={formatRupiah}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={warehouseGroups}
        searchable
        searchFields={["warehouse"]}
        showExport
        showColumnToggle
        title="inventory-value"
        totalColumns={["itemCount", "totalQty", "totalValue"]}
      />
    </PageLayout>
  );
}