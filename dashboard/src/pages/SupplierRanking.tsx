import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatRupiah, formatRupiahCompact, formatNumber, formatPercent } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import { useIsMobile } from "@/hooks/use-mobile";
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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface SupplierRankingProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface SupplierRank {
  rank: number;
  supplierName: string;
  totalPurchase: number;
  transactionCount: number;
  percentContribution: number;
}

export default function SupplierRanking({
  items,
  dateRange,
  onDateRangeChange,
}: SupplierRankingProps) {
  const isMobile = useIsMobile();
  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.netTotal, 0),
    [items],
  );

  const supplierRanks = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};

    items.forEach((item) => {
      const name = item.supplierName || "-";
      if (!grouped[name]) {
        grouped[name] = { total: 0, count: 0 };
      }
      grouped[name].total += item.netTotal;
      grouped[name].count += 1;
    });

    const sorted = Object.entries(grouped)
      .map(([name, data]) => ({
        supplierName: name,
        totalPurchase: data.total,
        transactionCount: data.count,
        percentContribution:
          grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.totalPurchase - a.totalPurchase);

    return sorted.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));
  }, [items, grandTotal]);

  const top1 = supplierRanks[0];
  const top5Total = supplierRanks
    .slice(0, 5)
    .reduce((sum, s) => sum + s.totalPurchase, 0);
  const top5Percent = grandTotal > 0 ? (top5Total / grandTotal) * 100 : 0;
  const avgPerSupplier =
    supplierRanks.length > 0 ? grandTotal / supplierRanks.length : 0;

  const chartData = supplierRanks.slice(0, 10).map((s) => ({
    name:
      s.supplierName.length > (isMobile ? 13 : 20)
        ? s.supplierName.substring(0, isMobile ? 13 : 20) + "..."
        : s.supplierName,
    total: s.totalPurchase,
  }));

  const columns = [
    { key: "rank", label: "Rank", align: "center" as const },
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "totalPurchase",
      label: "Total Pembelian",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierRank) => formatRupiah(item.totalPurchase),
    },
    {
      key: "transactionCount",
      label: "Jumlah Transaksi",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "percentContribution",
      label: "% Kontribusi",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierRank) => formatPercent(item.percentContribution),
    },
  ];

  return (
    <PageLayout
      title="Supplier Ranking"
      subtitle="Peringkat supplier berdasarkan total pembelian dan kontribusi terhadap total pembelian."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Top 1 Supplier"
          value={top1 ? formatRupiah(top1.totalPurchase) : "-"}
          subtitle={top1?.supplierName}
        />
        <StatCard
          title="Top 5 Suppliers (Gabungan)"
          value={formatRupiah(top5Total)}
          subtitle={formatPercent(top5Percent)}
        />
        <StatCard
          title="Jumlah Supplier"
          value={formatNumber(supplierRanks.length)}
        />
        <StatCard
          title="Rata-rata per Supplier"
          value={formatRupiah(avgPerSupplier)}
          accent
        />
      </div>

      <ChartCard
        title="Top 10 Supplier berdasarkan Total Pembelian"
        description="Peringkat supplier dengan nilai pembelian tertinggi"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(v) => formatRupiahCompact(Number(v))}
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 120 : 180}
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [
                formatRupiah(Number(value)),
                "Total Pembelian",
              ]}
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
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

      <DataTable columns={columns} data={supplierRanks} />
    </PageLayout>
  );
}
