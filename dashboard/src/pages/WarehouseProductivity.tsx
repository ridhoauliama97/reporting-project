import { useMemo } from "react";
import type { ParsedProduction } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatRupiah,
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
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface MachineRow {
  machine: string;
  operator: string;
  line: string;
  batchCount: number;
  totalQty: number;
  totalHours: number;
  totalCost: number;
  qtyPerHour: number;
}

const machineKey = (p: ParsedProduction): string =>
  p.machine?.trim() || p.operator?.trim() || "Tanpa Mesin";

export default function WarehouseProductivity({
  productions,
  dateRange,
  onDateRangeChange,
}: WarehouseProductivityProps) {
  const isMobile = useIsMobile();

  const totals = useMemo(() => {
    let totalQty = 0;
    let totalHours = 0;
    let totalCost = 0;
    productions.forEach((p) => {
      totalQty += p.quantity;
      totalHours += p.productionHour;
      totalCost += p.totalCog;
    });
    return {
      totalQty: round1(totalQty),
      totalHours: round1(totalHours),
      totalCost: round2(totalCost),
      qtyPerHour: totalHours > 0 ? round2(totalQty / totalHours) : 0,
    };
  }, [productions]);

  const machineRows = useMemo(() => {
    const grouped: Record<string, MachineRow> = {};
    productions.forEach((p) => {
      const key = machineKey(p);
      const label = p.machine?.trim() || "Tanpa Mesin";
      if (!grouped[key]) {
        grouped[key] = {
          machine: label,
          operator: p.operator?.trim() || "-",
          line: p.lineName?.trim() || "-",
          batchCount: 0,
          totalQty: 0,
          totalHours: 0,
          totalCost: 0,
          qtyPerHour: 0,
        };
      }
      const g = grouped[key];
      g.batchCount += 1;
      g.totalQty += p.quantity;
      g.totalHours += p.productionHour;
      g.totalCost += p.totalCog;
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        totalQty: round1(g.totalQty),
        totalHours: round1(g.totalHours),
        totalCost: round2(g.totalCost),
        qtyPerHour: g.totalHours > 0 ? round2(g.totalQty / g.totalHours) : 0,
      }))
      .sort((a, b) => b.totalQty - a.totalQty || b.totalCost - a.totalCost);
  }, [productions]);

  const topResource =
    productions.length > 0
      ? machineRows.reduce(
          (best, r) => (r.qtyPerHour > (best?.qtyPerHour ?? 0) ? r : best),
          machineRows[0],
        )
      : undefined;

  const chartData = useMemo(() => {
    const byMonth: Record<
      string,
      { key: string; label: string; qty: number; hours: number }
    > = {};
    productions.forEach((p) => {
      const key = monthKeyOf(p.productionDateObj);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(p.productionDateObj),
          qty: 0,
          hours: 0,
        };
      }
      byMonth[key].qty += p.quantity;
      byMonth[key].hours += p.productionHour;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({ ...m, qty: round1(m.qty), hours: round1(m.hours) }));
  }, [productions]);

  const machineChartData = useMemo(
    () =>
      machineRows.slice(0, 10).map((r) => ({
        name:
          r.machine.length > (isMobile ? 14 : 22)
            ? r.machine.substring(0, isMobile ? 14 : 22) + "..."
            : r.machine,
        total: r.qtyPerHour,
      })),
    [machineRows, isMobile],
  );

  const columns = [
    { key: "machine", label: "Mesin / Sumber Daya", sortable: true },
    { key: "operator", label: "Operator", sortable: true },
    { key: "line", label: "Lini", sortable: true },
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
      render: (r: MachineRow) => formatNumber(r.totalQty),
    },
    {
      key: "totalHours",
      label: "Jam Produksi",
      align: "right" as const,
      sortable: true,
      render: (r: MachineRow) => formatNumber(r.totalHours),
    },
    {
      key: "qtyPerHour",
      label: "Unit / Jam",
      align: "right" as const,
      sortable: true,
      render: (r: MachineRow) => formatNumber(r.qtyPerHour),
    },
    {
      key: "totalCost",
      label: "Biaya Produksi",
      align: "right" as const,
      sortable: true,
      render: (r: MachineRow) => formatRupiah(r.totalCost),
    },
  ];

  return (
    <PageLayout
      title="Warehouse Productivity"
      subtitle="Produktivitas pabrik/gudang dari data produksi (unit per jam produksi)."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Produktivitas dihitung dari catatan produksi (Production), bukan hasil
        time-and-motion. Metrik unit/jam bersifat proksi: jam produksi diambil
        dari field Production Hour pada setiap record. Diskrepansi antara qty
        produksi dan penggunaan material/output dapat dicermati di laporan
        produksi terkait.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Produksi" value={formatNumber(totals.totalQty)} />
        <StatCard title="Jam Produksi" value={formatNumber(totals.totalHours)} />
        <StatCard
          title="Biaya Produksi"
          value={formatRupiah(totals.totalCost)}
        />
        <StatCard
          title="Produktivitas Rata-rata"
          value={`${formatNumber(totals.qtyPerHour)} unit/jam`}
          subtitle={
            topResource
              ? `Terbaik: ${topResource.machine} (${formatNumber(topResource.qtyPerHour)} unit/jam)`
              : undefined
          }
          accent
        />
      </div>

      <ChartCard
        title="Produksi per Bulan"
        description="Total qty produksi per bulan pada rentang tanggal terpilih"
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
              name="Qty Produksi"
              fill="var(--color-chart-1)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="hours"
              name="Jam Produksi"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Produktivitas per Mesin (10 Teratas)"
        description="Unit per jam produksi, berdasarkan mesin/sumber daya"
      >
        <TopBarChart
          data={machineChartData}
          tooltipLabel="Unit/Jam"
          tooltipFormatter={formatNumber}
          yWidthMobile={100}
          yWidthDesktop={150}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={machineRows}
        searchable
        searchFields={["machine", "operator", "line"]}
        showExport
        showColumnToggle
        title="warehouse-productivity"
        totalColumns={["batchCount", "totalQty", "totalHours", "totalCost"]}
      />
    </PageLayout>
  );
}