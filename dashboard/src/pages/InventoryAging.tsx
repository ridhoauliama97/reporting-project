import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatDate,
  round1,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { CHART_COLORS } from "../utils/chart";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AGE_BUCKETS = [
  { label: "0–30 hari", min: 0, max: 30 },
  { label: "31–60 hari", min: 31, max: 60 },
  { label: "61–90 hari", min: 61, max: 90 },
  { label: "91–180 hari", min: 91, max: 180 },
  { label: "180+ hari", min: 181, max: Infinity },
];

interface InventoryAgingProps {
  stock: ParsedStockRecord[];
}

interface AgingRow {
  bucket: string;
  itemCount: number;
  totalQty: number;
  totalValue: number;
}

export default function InventoryAging({ stock }: InventoryAgingProps) {
  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const agingRows = useMemo(() => {
    return AGE_BUCKETS.map((bucket) => {
      const items = stock.filter(
        (s) => s.age >= bucket.min && s.age <= bucket.max,
      );
      return {
        bucket: bucket.label,
        itemCount: items.length,
        totalQty: round1(items.reduce((sum, s) => sum + s.onHand, 0)),
        totalValue: round1(
          items.reduce((sum, s) => sum + s.onHand * s.lastPurchaseCost, 0),
        ),
      };
    });
  }, [stock]);

  const totalItems = useMemo(
    () => agingRows.reduce((sum, r) => sum + r.itemCount, 0),
    [agingRows],
  );
  const totalValue = useMemo(
    () => agingRows.reduce((sum, r) => sum + r.totalValue, 0),
    [agingRows],
  );
  const totalQty = useMemo(
    () => agingRows.reduce((sum, r) => sum + r.totalQty, 0),
    [agingRows],
  );
  const oldRow = agingRows[agingRows.length - 1];

  const chartData = agingRows.map((r) => ({
    name: r.bucket,
    total: r.totalValue,
  }));

  const columns = [
    { key: "bucket", label: "Umur Stok", sortable: true },
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
      render: (r: AgingRow) => formatNumber(r.totalQty),
    },
    {
      key: "totalValue",
      label: "Nilai",
      align: "right" as const,
      sortable: true,
      render: (r: AgingRow) => formatRupiah(r.totalValue),
    },
  ];

  return (
    <PageLayout
      title="Inventory Aging"
      subtitle="Distribusi umur stok (hari sejak barang diterima) per rentang umur."
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Umur stok diambil dari field{" "}
        <code>age</code> di data sumber (hari sejak barang diterima).
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Item" value={formatNumber(totalItems)} />
        <StatCard title="Total On-Hand" value={formatNumber(totalQty)} />
        <StatCard title="Nilai Persediaan" value={formatRupiah(totalValue)} />
        <StatCard
          title="Item Umur 180+ Hari"
          value={formatNumber(oldRow?.itemCount ?? 0)}
          subtitle="Berisiko menjadi dead stock"
          accent
        />
      </div>

      <ChartCard
        title="Nilai Persediaan per Kelompok Umur"
        description="Semakin tua stok, semakin besar risiko kerusakan/kedaluwarsa"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [formatRupiah(Number(value)), "Nilai"]}
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {chartData.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={CHART_COLORS[idx % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        data={agingRows}
        showExport
        showColumnToggle
        title="inventory-aging"
        totalColumns={["itemCount", "totalQty", "totalValue"]}
      />
    </PageLayout>
  );
}