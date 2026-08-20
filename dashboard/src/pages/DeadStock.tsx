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

const DEAD_STOCK_DAYS = 180;

interface DeadStockProps {
  stock: ParsedStockRecord[];
}

interface DeadStockRow {
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

export default function DeadStock({ stock }: DeadStockProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const deadRows = useMemo(() => {
    return stock
      .filter(
        (s) => s.onHand > 0 && s.daysSinceLastUsage >= DEAD_STOCK_DAYS,
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
    () => deadRows.reduce((sum, r) => sum + r.onHand, 0),
    [deadRows],
  );
  const totalValue = useMemo(
    () => deadRows.reduce((sum, r) => sum + r.value, 0),
    [deadRows],
  );
  const deadPercent = useMemo(() => {
    const withStock = stock.filter((s) => s.onHand > 0).length;
    return withStock > 0 ? (deadRows.length / withStock) * 100 : 0;
  }, [stock, deadRows]);

  const chartData = useMemo(
    () =>
      deadRows.slice(0, 10).map((r) => ({
        name:
          r.itemName.length > (isMobile ? 18 : 28)
            ? r.itemName.substring(0, isMobile ? 18 : 28) + "..."
            : r.itemName,
        total: round1(r.value),
      })),
    [deadRows, isMobile],
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
      render: (r: DeadStockRow) => formatNumber(r.onHand),
    },
    { key: "uom", label: "Satuan" },
    {
      key: "lastUsageDate",
      label: "Terakhir Dipakai",
      render: (r: DeadStockRow) => formatDate(r.lastUsageDate),
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
      render: (r: DeadStockRow) => formatRupiah(r.value),
    },
  ];

  return (
    <PageLayout
      title="Dead Stock"
      subtitle={`Item dengan stok tersedia yang tidak terpakai selama ≥ ${DEAD_STOCK_DAYS} hari.`}
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Dead stock didefinisikan sebagai item dengan
        on-hand &gt; 0 dan hari tanpa pemakaian (days since last usage) ≥{" "}
        {DEAD_STOCK_DAYS} hari.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Item Dead Stock"
          value={formatNumber(deadRows.length)}
        />
        <StatCard title="Total On-Hand" value={formatNumber(totalQty)} />
        <StatCard title="Nilai Terkunci" value={formatRupiah(totalValue)} />
        <StatCard
          title="% dari Total Item Berstok"
          value={`${deadPercent.toFixed(1)}%`}
          accent
        />
      </div>

      <ChartCard
        title="Item Dead Stock Terbesar (10 Teratas)"
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
        data={deadRows}
        searchable
        searchFields={["itemCode", "itemName", "warehouse"]}
        showExport
        showColumnToggle
        title="dead-stock"
        totalColumns={["onHand", "value"]}
      />
    </PageLayout>
  );
}