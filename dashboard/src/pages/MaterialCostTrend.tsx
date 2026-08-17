import { useMemo, useState } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import {
  formatRupiah,
  formatRupiahCompact,
  formatPercent,
  getMonthYear,
  getMonthLabel,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface MaterialCostTrendProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const CATEGORIES = [
  "BAHAN BAKU",
  "BAHAN PENDUKUNG",
  "SPAREPART",
  "WORK IN PROGRESS",
  "BARANG DAGANG",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "BAHAN BAKU": "Bahan Baku",
  "BAHAN PENDUKUNG": "Bahan Pendukung",
  SPAREPART: "Sparepart",
  "WORK IN PROGRESS": "Work In Progress",
  "BARANG DAGANG": "Barang Dagang",
};

const CATEGORY_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export default function MaterialCostTrend({
  items,
  dateRange,
  onDateRangeChange,
}: MaterialCostTrendProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(CATEGORIES),
  );

  const toggleCategory = (category: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const selectedCategories = CATEGORIES.filter((c) => selected.has(c));

  interface MonthRow {
  month: string;
  label: string;
  total: number;
  [category: string]: number | string;
}

  const filteredItems = useMemo(
    () => items.filter((item) => selected.has(item.itemCategory)),
    [items, selected],
  );

  const monthlyData = useMemo<MonthRow[]>(() => {
    const grouped: Record<string, MonthRow> = {};

    filteredItems.forEach((item) => {
      const monthKey = getMonthYear(item.purchaseDate);
      if (!monthKey) return;
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: monthKey,
          label: getMonthLabel(monthKey),
          total: 0,
        };
      }
      grouped[monthKey][item.itemCategory] =
        ((grouped[monthKey][item.itemCategory] as number) ?? 0) +
        item.netTotal;
      grouped[monthKey].total += item.netTotal;
    });

    return Object.values(grouped).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }, [filteredItems]);

  const totalCost = useMemo(
    () => filteredItems.reduce((sum, i) => sum + i.netTotal, 0),
    [filteredItems],
  );
  const avgPerMonth =
    monthlyData.length > 0 ? totalCost / monthlyData.length : 0;
  const highestMonth = monthlyData.reduce(
    (max, m) => (m.total > max.total ? m : max),
    monthlyData[0],
  );

  const prevMonth =
    monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2] : null;
  const currentMonth =
    monthlyData.length >= 1 ? monthlyData[monthlyData.length - 1] : null;
  const trendPercent =
    prevMonth && currentMonth && prevMonth.total > 0
      ? ((currentMonth.total - prevMonth.total) / prevMonth.total) * 100
      : 0;

  const chartData = monthlyData.map((m) => {
    const row: Record<string, number | string> = { name: m.label };
    selectedCategories.forEach((category) => {
      row[CATEGORY_LABELS[category]] = Number(m[category] ?? 0);
    });
    return row;
  });

  const tableData = monthlyData.map((m) => {
    const row: Record<string, number | string> = { month: m.label };
    selectedCategories.forEach((category) => {
      row[CATEGORY_LABELS[category]] = m[category] ?? 0;
    });
    row.total = m.total;
    return row;
  });

  const columns = [
    { key: "month", label: "Bulan", sortable: true },
    ...selectedCategories.map((category) => ({
      key: CATEGORY_LABELS[category],
      label: CATEGORY_LABELS[category],
      align: "right" as const,
      render: (item: any) => formatRupiah(Number(item[CATEGORY_LABELS[category]])),
    })),
    {
      key: "total",
      label: "Total",
      align: "right" as const,
      render: (item: any) => formatRupiah(Number(item.total)),
    },
  ];

  const noneSelected = selectedCategories.length === 0;

  return (
    <PageLayout
      title="Material Cost Trends"
      subtitle="Tren biaya pembelian per bulan berdasarkan kategori yang dipilih."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="shrink-0 text-sm font-medium text-muted-foreground">
            Filter Kategori
          </label>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selected.has(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span>{CATEGORY_LABELS[category]}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Biaya Pembelian"
          value={formatRupiah(totalCost)}
        />
        <StatCard
          title="Rata-rata Biaya per Bulan"
          value={formatRupiah(avgPerMonth)}
        />
        <StatCard
          title="Bulan dengan Biaya Tertinggi"
          value={highestMonth?.label || "-"}
          subtitle={highestMonth ? formatRupiah(highestMonth.total) : ""}
          accent
        />
        <StatCard
          title="Trend vs Bulan Lalu"
          value={formatPercent(trendPercent)}
        />
      </div>

      <ChartCard
        title="Grafik Tren Biaya per Bulan"
        description="Total netto per kategori terpilih per bulan"
      >
        {noneSelected ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Pilih minimal satu kategori untuk menampilkan grafik.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                interval="preserveStartEnd"
                angle={-35}
                textAnchor="end"
                height={50}
                tickMargin={6}
              />
              <YAxis
                tickFormatter={(v) => formatRupiahCompact(Number(v))}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                formatter={(value) => formatRupiah(Number(value))}
                contentStyle={{ borderRadius: 8 }}
              />
              <Legend />
              {selectedCategories.map((category, idx) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={CATEGORY_LABELS[category]}
                  stroke={CATEGORY_COLORS[idx]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <DataTable columns={columns} data={tableData} />
    </PageLayout>
  );
}