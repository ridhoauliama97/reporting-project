import { useMemo } from "react";
import type { ParsedAdjustment } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatRupiah,
  warehouseFull,
  monthKeyOf,
  monthLabelOf,
  round1,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockAdjustmentProps {
  adjustments: ParsedAdjustment[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface WarehouseAdjustment {
  warehouse: string;
  count: number;
  qtyIn: number;
  qtyOut: number;
  netValue: number;
}

export default function StockAdjustment({
  adjustments,
  dateRange,
  onDateRangeChange,
}: StockAdjustmentProps) {
  const warehouseRows = useMemo(() => {
    const grouped: Record<string, WarehouseAdjustment> = {};
    adjustments.forEach((a) => {
      const wh = warehouseFull(a.warehouseCode, a.warehouseName);
      if (!grouped[wh]) {
        grouped[wh] = {
          warehouse: wh,
          count: 0,
          qtyIn: 0,
          qtyOut: 0,
          netValue: 0,
        };
      }
      grouped[wh].count += 1;
      grouped[wh].qtyIn += a.quantityCR;
      grouped[wh].qtyOut += a.quantityDB;
      grouped[wh].netValue += a.adjustedValue;
    });
    return Object.values(grouped).sort(
      (a, b) => b.count - a.count || b.netValue - a.netValue,
    );
  }, [adjustments]);

  const totalCount = adjustments.length;
  const totalValue = useMemo(
    () => adjustments.reduce((sum, a) => sum + a.adjustedValue, 0),
    [adjustments],
  );
  const totalQtyIn = useMemo(
    () => adjustments.reduce((sum, a) => sum + a.quantityCR, 0),
    [adjustments],
  );
  const totalQtyOut = useMemo(
    () => adjustments.reduce((sum, a) => sum + a.quantityDB, 0),
    [adjustments],
  );

  const chartData = useMemo(() => {
    const byMonth: Record<string, { key: string; label: string; in: number; out: number }> = {};
    adjustments.forEach((a) => {
      const key = monthKeyOf(a.adjustmentDateObj);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(a.adjustmentDateObj),
          in: 0,
          out: 0,
        };
      }
      byMonth[key].in += a.quantityCR;
      byMonth[key].out += a.quantityDB;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({ ...m, in: round1(m.in), out: round1(m.out) }));
  }, [adjustments]);

  const columns = [
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "count",
      label: "Jumlah Adjustment",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "qtyIn",
      label: "Qty Masuk (CR)",
      align: "right" as const,
      sortable: true,
      render: (r: WarehouseAdjustment) => formatNumber(r.qtyIn),
    },
    {
      key: "qtyOut",
      label: "Qty Keluar (DB)",
      align: "right" as const,
      sortable: true,
      render: (r: WarehouseAdjustment) => formatNumber(r.qtyOut),
    },
    {
      key: "netValue",
      label: "Nilai Bersih",
      align: "right" as const,
      sortable: true,
      render: (r: WarehouseAdjustment) => formatRupiah(r.netValue),
    },
  ];

  return (
    <PageLayout
      title="Stock Adjustment"
      subtitle="Koreksi stok (penambahan/pengurangan) per gudang."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Data berisi seluruh record adjustment berstatus approved. Qty masuk
        (CR) dan qty keluar (DB) per baris adjustment; filter tanggal berlaku
        pada tanggal adjustment.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Adjustment"
          value={formatNumber(totalCount)}
        />
        <StatCard
          title="Total Nilai Koreksi"
          value={formatRupiah(totalValue)}
        />
        <StatCard
          title="Qty Masuk (CR)"
          value={formatNumber(totalQtyIn)}
        />
        <StatCard
          title="Qty Keluar (DB)"
          value={formatNumber(totalQtyOut)}
          accent
        />
      </div>

      <ChartCard
        title="Qty Masuk vs Keluar per Bulan"
        description="Koreksi stok bulanan (CR = masuk, DB = keluar)"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="label"
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
              formatter={(value) => formatNumber(Number(value))}
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Legend />
            <Bar dataKey="in" name="Masuk (CR)" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="out" name="Keluar (DB)" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        data={warehouseRows}
        searchable
        searchFields={["warehouse"]}
        showExport
        showColumnToggle
        title="stock-adjustment"
        totalColumns={["count", "qtyIn", "qtyOut"]}
      />
    </PageLayout>
  );
}