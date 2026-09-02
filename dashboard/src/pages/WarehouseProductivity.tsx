import { useMemo } from "react";
import type {
  ParsedProduction,
  ParsedProductionMaterial,
  ParsedProductionOutput,
} from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatRupiah,
  formatPercent,
  round1,
  round2,
  monthKeyOf,
  monthLabelOf,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface WarehouseProductivityProps {
  productions: ParsedProduction[];
  productionMaterials: ParsedProductionMaterial[];
  productionOutputs: ParsedProductionOutput[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface LineRow {
  line: string;
  batchCount: number;
  totalQty: number;
  totalCost: number;
}

export default function WarehouseProductivity({
  productions,
  productionMaterials,
  productionOutputs,
  dateRange,
  onDateRangeChange,
}: WarehouseProductivityProps) {
  const isMobile = useIsMobile();

  const totals = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    productions.forEach((p) => {
      totalQty += p.quantity > 0 ? p.quantity : 0;
      totalCost += p.totalCog;
    });
    let materialQty = 0;
    productionMaterials.forEach((m) => {
      materialQty += m.quantity > 0 ? m.quantity : 0;
    });
    let outputQty = 0;
    let wasteQty = 0;
    productionOutputs.forEach((o) => {
      outputQty += o.quantity > 0 ? o.quantity : 0;
      wasteQty += o.totalWaste;
    });
    return {
      totalQty: round1(totalQty),
      totalCost: round2(totalCost),
      materialQty: round1(materialQty),
      outputQty: round1(outputQty),
      wasteQty: round1(wasteQty),
      yieldPct:
        materialQty > 0 ? round2((outputQty / materialQty) * 100) : 0,
    };
  }, [productions, productionMaterials, productionOutputs]);

  const lineRows: LineRow[] = useMemo(() => {
    const grouped: Record<string, LineRow> = {};
    productions.forEach((p) => {
      const line = p.lineName?.trim() || "Tanpa Lini";
      if (!grouped[line]) {
        grouped[line] = {
          line,
          batchCount: 0,
          totalQty: 0,
          totalCost: 0,
        };
      }
      const g = grouped[line];
      g.batchCount += 1;
      g.totalQty += p.quantity > 0 ? p.quantity : 0;
      g.totalCost += p.totalCog;
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        totalCost: round2(g.totalCost),
        totalQty: round1(g.totalQty),
      }))
      .sort((a, b) => b.totalQty - a.totalQty || b.totalCost - a.totalCost);
  }, [productions]);

  const topLine = lineRows[0];

  const chartData = useMemo(() => {
    const byMonth: Record<
      string,
      {
        key: string;
        label: string;
        qty: number;
        cost: number;
        material: number;
        output: number;
      }
    > = {};
    productions.forEach((p) => {
      const key = monthKeyOf(p.productionDateObj);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(p.productionDateObj),
          qty: 0,
          cost: 0,
          material: 0,
          output: 0,
        };
      }
      byMonth[key].qty += p.quantity > 0 ? p.quantity : 0;
      byMonth[key].cost += p.totalCog;
    });
    productionMaterials.forEach((m) => {
      const key = monthKeyOf(m.productionDateObj);
      if (!key || !byMonth[key]) return;
      byMonth[key].material += m.quantity;
    });
    productionOutputs.forEach((o) => {
      const key = monthKeyOf(o.productionDateObj);
      if (!key || !byMonth[key]) return;
      byMonth[key].output += o.quantity;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({
        ...m,
        qty: round1(m.qty),
        cost: round2(m.cost),
        material: round1(m.material),
        output: round1(m.output),
      }));
  }, [productions, productionMaterials, productionOutputs]);

  const lineChartData = useMemo(
    () =>
      lineRows.slice(0, 10).map((r) => ({
        name:
          r.line.length > (isMobile ? 14 : 22)
            ? r.line.substring(0, isMobile ? 14 : 22) + "..."
            : r.line,
        total: r.totalQty,
      })),
    [lineRows, isMobile],
  );

  const columns = [
    { key: "line", label: "Lini Produksi", sortable: true },
    {
      key: "batchCount",
      label: "Jumlah Batch",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "totalQty",
      label: "Total Produksi",
      align: "right" as const,
      sortable: true,
      render: (r: LineRow) => formatNumber(r.totalQty),
    },
    {
      key: "totalCost",
      label: "Biaya Produksi",
      align: "right" as const,
      sortable: true,
      render: (r: LineRow) => formatRupiah(r.totalCost),
    },
  ];

  return (
    <PageLayout
      title="Warehouse Productivity"
      subtitle="Produktivitas proses di gudang: output produksi vs material terpakai."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Snapshot produksi ini tidak menyertakan jam kerja, mesin, maupun
        operator (field kosong di sumber data), sehingga metrik unit/jam atau
        transaksi per pegawai tidak dapat dihitung. Sebagai gantinya, laporan
        menampilkan metrik riil yang tersedia: kuantitas produksi, biaya, dan
        rasio output terhadap material terpakai (yield) sebagai proksi
        produktivitas.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produksi" value={formatNumber(totals.totalQty)} />
        <StatCard
          title="Biaya Produksi"
          value={formatRupiah(totals.totalCost)}
        />
        <StatCard
          title="Rasio Output / Material"
          value={formatPercent(totals.yieldPct)}
          subtitle={`Output ${formatNumber(totals.outputQty)} dari material ${formatNumber(totals.materialQty)}`}
        />
        <StatCard
          title="Lini Terbesar"
          value={formatNumber(topLine?.totalQty ?? 0)}
          subtitle={topLine?.line}
          accent
        />
      </div>

      <ChartCard
        title="Produksi vs Material Terpakai per Bulan"
        description="Total qty produksi dan material terpakai pada rentang tanggal terpilih"
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
            <Bar
              dataKey="qty"
              name="Produksi"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="material"
              name="Material Terpakai"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Produksi per Lini (10 Teratas)"
        description="Total qty produksi per lini"
      >
        <TopBarChart
          data={lineChartData}
          tooltipLabel="Produksi"
          tooltipFormatter={formatNumber}
          yWidthMobile={100}
          yWidthDesktop={150}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={lineRows}
        searchable
        searchFields={["line"]}
        showExport
        showColumnToggle
        title="warehouse-productivity"
        totalColumns={["batchCount", "totalQty", "totalCost"]}
      />
    </PageLayout>
  );
}