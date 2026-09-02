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

const SLOW_MOVING_MIN_DAYS = 90;
const SLOW_MOVING_MAX_DAYS = 179;

interface SlowMovingProps {
  stock: ParsedStockRecord[];
}

interface SlowMovingRow {
  itemCode: string;
  itemName: string;
  warehouse: string;
  uom: string;
  onHand: number;
  lastUsageDate: string;
  daysSinceLastUsage: number;
  age: number;
  value: number;
}

export default function SlowMoving({ stock }: SlowMovingProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const slowRows = useMemo(() => {
    return stock
      .filter(
        (s) =>
          s.onHand > 0 &&
          s.daysSinceLastUsage >= SLOW_MOVING_MIN_DAYS &&
          s.daysSinceLastUsage <= SLOW_MOVING_MAX_DAYS,
      )
      .map((s) => ({
        itemCode: s.itemCode,
        itemName: s.itemName,
        warehouse: warehouseFull(s.warehouseCode, s.warehouseName),
        uom: s.uom,
        onHand: s.onHand,
        lastUsageDate: s.lastUsageDate,
        daysSinceLastUsage: s.daysSinceLastUsage,
        age: s.age,
        value: s.onHand * s.lastPurchaseCost,
      }))
      .sort((a, b) => b.daysSinceLastUsage - a.daysSinceLastUsage);
  }, [stock]);

  const totalQty = useMemo(
    () => slowRows.reduce((sum, r) => sum + r.onHand, 0),
    [slowRows],
  );
  const totalValue = useMemo(
    () => slowRows.reduce((sum, r) => sum + r.value, 0),
    [slowRows],
  );

  const chartData = useMemo(
    () =>
      slowRows.slice(0, 10).map((r) => ({
        name:
          r.itemName.length > (isMobile ? 18 : 28)
            ? r.itemName.substring(0, isMobile ? 18 : 28) + "..."
            : r.itemName,
        total: round1(r.value),
      })),
    [slowRows, isMobile],
  );

  const columns = [
    { key: "itemCode", label: "Kode Item" },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "onHand",
      label: "On-Hand",
      align: "right" as const,
      sortable: true,
      render: (r: SlowMovingRow) => formatNumber(r.onHand),
    },
    { key: "uom", label: "Satuan" },
    {
      key: "lastUsageDate",
      label: "Terakhir Dipakai",
      render: (r: SlowMovingRow) => formatDate(r.lastUsageDate),
    },
    {
      key: "daysSinceLastUsage",
      label: "Hari Tanpa Pemakaian",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "value",
      label: "Nilai",
      align: "right" as const,
      sortable: true,
      render: (r: SlowMovingRow) => formatRupiah(r.value),
    },
  ];

  return (
    <PageLayout
      title="Slow Moving"
      subtitle={`Item dengan perputaran lambat: pemakaian terakhir ${SLOW_MOVING_MIN_DAYS}–${SLOW_MOVING_MAX_DAYS} hari lalu.`}
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Slow moving didefinisikan sebagai item dengan
        on-hand &gt; 0 dan hari tanpa pemakaian antara {SLOW_MOVING_MIN_DAYS}–
        {SLOW_MOVING_MAX_DAYS} hari.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Item Slow Moving"
          value={formatNumber(slowRows.length)}
        />
        <StatCard title="Total On-Hand" value={formatNumber(totalQty)} />
        <StatCard title="Total Nilai" value={formatRupiah(totalValue)} />
        <StatCard
          title="Rata-rata Nilai per Item"
          value={formatRupiah(slowRows.length > 0 ? totalValue / slowRows.length : 0)}
          accent
        />
      </div>

      <ChartCard
        title="Item Slow Moving Terbesar (10 Teratas)"
        description="Berdasarkan nilai on-hand × harga beli terakhir"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Nilai"
          tickFormatter={formatRupiahCompact}
          tooltipFormatter={formatRupiah}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={slowRows}
        searchable
        searchFields={["itemCode", "itemName", "warehouse"]}
        showExport
        showColumnToggle
        title="slow-moving"
        totalColumns={["onHand", "value"]}
      />
    </PageLayout>
  );
}