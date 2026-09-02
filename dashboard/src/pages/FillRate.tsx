import { useMemo } from "react";
import type { ParsedTransfer } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatPercent,
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

interface FillRateProps {
  transfers: ParsedTransfer[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface WarehouseFillRate {
  warehouse: string;
  qtyTransferred: number;
  qtyReceived: number;
  fillRate: number;
  pendingCount: number;
}

export default function FillRate({
  transfers,
  dateRange,
  onDateRangeChange,
}: FillRateProps) {
  const isMobile = useIsMobile();

  const warehouseRows = useMemo(() => {
    const grouped: Record<string, WarehouseFillRate> = {};
    transfers.forEach((t) => {
      const wh = warehouseFull(
        t.destinationWarehouseCode,
        t.destinationWarehouseName,
      );
      if (!grouped[wh]) {
        grouped[wh] = {
          warehouse: wh,
          qtyTransferred: 0,
          qtyReceived: 0,
          fillRate: 0,
          pendingCount: 0,
        };
      }
      grouped[wh].qtyTransferred += t.quantity;
      grouped[wh].qtyReceived += t.receivedQuantity;
      if (t.received === "Pending") grouped[wh].pendingCount += 1;
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        fillRate:
          g.qtyTransferred > 0
            ? (g.qtyReceived / g.qtyTransferred) * 100
            : 0,
      }))
      .sort((a, b) => b.qtyTransferred - a.qtyTransferred);
  }, [transfers]);

  const totalQty = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.qtyTransferred, 0),
    [warehouseRows],
  );
  const totalReceived = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.qtyReceived, 0),
    [warehouseRows],
  );
  const overallFillRate = totalQty > 0 ? (totalReceived / totalQty) * 100 : 0;
  const pendingCount = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.pendingCount, 0),
    [warehouseRows],
  );

  const chartData = useMemo(
    () =>
      warehouseRows.slice(0, 10).map((g) => ({
        name:
          g.warehouse.length > (isMobile ? 13 : 20)
            ? g.warehouse.substring(0, isMobile ? 13 : 20) + "..."
            : g.warehouse,
        total: round1(g.fillRate),
      })),
    [warehouseRows, isMobile],
  );

  const columns = [
    { key: "warehouse", label: "Gudang Tujuan", sortable: true },
    {
      key: "qtyTransferred",
      label: "Qty Dikirim",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseFillRate) => formatNumber(g.qtyTransferred),
    },
    {
      key: "qtyReceived",
      label: "Qty Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseFillRate) => formatNumber(g.qtyReceived),
    },
    {
      key: "fillRate",
      label: "Fill Rate",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseFillRate) => formatPercent(g.fillRate),
    },
    {
      key: "pendingCount",
      label: "Belum Diterima",
      align: "right" as const,
      sortable: true,
    },
  ];

  return (
    <PageLayout
      title="Fill Rate"
      subtitle="Tingkat pemenuhan transfer per gudang tujuan (qty diterima ÷ qty dikirim)."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Fill rate dihitung dari data transfer antar gudang (bukan dari PO
        pembelian): qty diterima dibanding qty yang dikirim. Filter tanggal
        berlaku pada tanggal transfer.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fill Rate Keseluruhan"
          value={formatPercent(overallFillRate)}
          accent
        />
        <StatCard title="Qty Dikirim" value={formatNumber(totalQty)} />
        <StatCard title="Qty Diterima" value={formatNumber(totalReceived)} />
        <StatCard
          title="Transfer Belum Diterima"
          value={formatNumber(pendingCount)}
        />
      </div>

      <ChartCard
        title="Fill Rate per Gudang (10 Teratas)"
        description="Gudang tujuan dengan qty dikirim terbanyak"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Fill Rate"
          tickFormatter={(v) => `${v}%`}
          tooltipFormatter={formatPercent}
          xDomain={[0, 100]}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={warehouseRows}
        searchable
        searchFields={["warehouse"]}
        showExport
        showColumnToggle
        title="fill-rate"
        totalColumns={["qtyTransferred", "qtyReceived"]}
      />
    </PageLayout>
  );
}