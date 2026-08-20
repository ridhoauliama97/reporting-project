import { useMemo } from "react";
import type { ParsedTransfer } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
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
  ResponsiveContainer,
} from "recharts";

interface DeliveryPerformanceProps {
  transfers: ParsedTransfer[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface WarehouseDelivery {
  warehouse: string;
  count: number;
  receivedCount: number;
  pendingCount: number;
  totalDays: number;
  avgDays: number;
}

const DAY_MS = 86400000;

export default function DeliveryPerformance({
  transfers,
  dateRange,
  onDateRangeChange,
}: DeliveryPerformanceProps) {
  const warehouseRows = useMemo(() => {
    const grouped: Record<string, WarehouseDelivery> = {};
    transfers.forEach((t) => {
      const wh = warehouseFull(
        t.destinationWarehouseCode,
        t.destinationWarehouseName,
      );
      if (!grouped[wh]) {
        grouped[wh] = {
          warehouse: wh,
          count: 0,
          receivedCount: 0,
          pendingCount: 0,
          totalDays: 0,
          avgDays: 0,
        };
      }
      grouped[wh].count += 1;
      if (t.received === "Received" && t.receivedDateObj && t.transferDateObj) {
        grouped[wh].receivedCount += 1;
        grouped[wh].totalDays +=
          (t.receivedDateObj.getTime() - t.transferDateObj.getTime()) / DAY_MS;
      } else {
        grouped[wh].pendingCount += 1;
      }
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        avgDays:
          g.receivedCount > 0 ? g.totalDays / g.receivedCount : 0,
      }))
      .sort((a, b) => b.avgDays - a.avgDays || b.count - a.count);
  }, [transfers]);

  const totalCount = transfers.length;
  const receivedCount = useMemo(
    () => transfers.filter((t) => t.received === "Received").length,
    [transfers],
  );
  const pendingCount = totalCount - receivedCount;
  const avgDays = useMemo(() => {
    let days = 0;
    let n = 0;
    transfers.forEach((t) => {
      if (t.received === "Received" && t.receivedDateObj && t.transferDateObj) {
        days +=
          (t.receivedDateObj.getTime() - t.transferDateObj.getTime()) / DAY_MS;
        n += 1;
      }
    });
    return n > 0 ? days / n : 0;
  }, [transfers]);

  const chartData = useMemo(() => {
    const byMonth: Record<string, { key: string; label: string; total: number; count: number }> = {};
    transfers.forEach((t) => {
      if (t.received !== "Received" || !t.receivedDateObj || !t.transferDateObj)
        return;
      const key = monthKeyOf(t.receivedDateObj);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(t.receivedDateObj),
          total: 0,
          count: 0,
        };
      }
      byMonth[key].total +=
        (t.receivedDateObj.getTime() - t.transferDateObj.getTime()) / DAY_MS;
      byMonth[key].count += 1;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({
        label: m.label,
        total: round1(m.count > 0 ? m.total / m.count : 0),
      }));
  }, [transfers]);

  const columns = [
    { key: "warehouse", label: "Gudang Tujuan", sortable: true },
    {
      key: "count",
      label: "Jumlah Transfer",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "receivedCount",
      label: "Diterima",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "pendingCount",
      label: "Pending",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "avgDays",
      label: "Rata-rata Hari",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseDelivery) => `${g.avgDays.toFixed(1)} hari`,
    },
  ];

  return (
    <PageLayout
      title="Delivery Performance"
      subtitle="Kinerja pengiriman transfer antar gudang berdasarkan selisih tanggal kirim dan tanggal terima."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Proksi dari data transfer: lama pengiriman dihitung dari selisih
        tanggal transfer ke tanggal diterima (transfer yang belum diterima
        tidak dihitung rata-ratanya). Filter tanggal berlaku pada tanggal
        transfer.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Rata-rata Hari Kirim"
          value={`${avgDays.toFixed(1)} hari`}
          accent
        />
        <StatCard title="Jumlah Transfer" value={formatNumber(totalCount)} />
        <StatCard title="Diterima" value={formatNumber(receivedCount)} />
        <StatCard title="Pending" value={formatNumber(pendingCount)} />
      </div>

      <ChartCard
        title="Rata-rata Hari Kirim per Bulan"
        description="Berdasarkan tanggal diterima"
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
              formatter={(value) => [`${Number(value).toFixed(1)} hari`, "Rata-rata"]}
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
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
        title="delivery-performance"
      />
    </PageLayout>
  );
}