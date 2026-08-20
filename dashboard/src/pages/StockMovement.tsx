
import type { DateRange } from "../types/ui";import { useMemo } from "react";
import type {
  ParsedTransfer,
  ParsedAdjustment,
  ParsedUsage,
} from "../types/purchase";
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
  Legend,
  ResponsiveContainer,
} from "recharts";

interface StockMovementProps {
  transfers: ParsedTransfer[];
  adjustments: ParsedAdjustment[];
  usages: ParsedUsage[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface Movement {
  warehouse: string;
  direction: "IN" | "OUT";
  qty: number;
  date: Date | null;
}

interface WarehouseMovement {
  warehouse: string;
  qtyIn: number;
  qtyOut: number;
  net: number;
  count: number;
}

export default function StockMovement({
  transfers,
  adjustments,
  usages,
  dateRange,
  onDateRangeChange,
}: StockMovementProps) {
  const movements = useMemo<Movement[]>(() => {
    const list: Movement[] = [];
    transfers.forEach((t) => {
      list.push({
        warehouse: warehouseFull(t.originWarehouseCode, t.originWarehouseName),
        direction: "OUT",
        qty: t.quantity,
        date: t.transferDateObj,
      });
      list.push({
        warehouse: warehouseFull(
          t.destinationWarehouseCode,
          t.destinationWarehouseName,
        ),
        direction: "IN",
        qty: t.receivedQuantity,
        date: t.receivedDateObj ?? t.transferDateObj,
      });
    });
    adjustments.forEach((a) => {
      if (a.quantityCR > 0) {
        list.push({
          warehouse: warehouseFull(a.warehouseCode, a.warehouseName),
          direction: "IN",
          qty: a.quantityCR,
          date: a.adjustmentDateObj,
        });
      }
      if (a.quantityDB > 0) {
        list.push({
          warehouse: warehouseFull(a.warehouseCode, a.warehouseName),
          direction: "OUT",
          qty: a.quantityDB,
          date: a.adjustmentDateObj,
        });
      }
    });
    usages.forEach((u) => {
      list.push({
        warehouse: warehouseFull(u.warehouseCode, u.warehouseName),
        direction: "OUT",
        qty: u.quantity,
        date: u.usageDateObj,
      });
    });
    return list;
  }, [transfers, adjustments, usages]);

  const warehouseRows = useMemo(() => {
    const grouped: Record<string, WarehouseMovement> = {};
    movements.forEach((m) => {
      if (!grouped[m.warehouse]) {
        grouped[m.warehouse] = {
          warehouse: m.warehouse,
          qtyIn: 0,
          qtyOut: 0,
          net: 0,
          count: 0,
        };
      }
      grouped[m.warehouse].count += 1;
      if (m.direction === "IN") grouped[m.warehouse].qtyIn += m.qty;
      else grouped[m.warehouse].qtyOut += m.qty;
    });
    return Object.values(grouped)
      .map((g) => ({
        ...g,
        qtyIn: round1(g.qtyIn),
        qtyOut: round1(g.qtyOut),
        net: round1(g.qtyIn - g.qtyOut),
      }))
      .sort((a, b) => b.qtyIn + b.qtyOut - (a.qtyIn + a.qtyOut));
  }, [movements]);

  const totalIn = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.qtyIn, 0),
    [warehouseRows],
  );
  const totalOut = useMemo(
    () => warehouseRows.reduce((sum, g) => sum + g.qtyOut, 0),
    [warehouseRows],
  );
  const totalNet = totalIn - totalOut;
  const topWarehouse = warehouseRows[0];

  const chartData = useMemo(() => {
    const byMonth: Record<
      string,
      { key: string; label: string; in: number; out: number }
    > = {};
    movements.forEach((m) => {
      const key = monthKeyOf(m.date);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(m.date),
          in: 0,
          out: 0,
        };
      }
      if (m.direction === "IN") byMonth[key].in += m.qty;
      else byMonth[key].out += m.qty;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({ ...m, in: round1(m.in), out: round1(m.out) }));
  }, [movements]);

  const columns = [
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "count",
      label: "Jumlah Pergerakan",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "qtyIn",
      label: "Qty Masuk",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseMovement) => formatNumber(g.qtyIn),
    },
    {
      key: "qtyOut",
      label: "Qty Keluar",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseMovement) => formatNumber(g.qtyOut),
    },
    {
      key: "net",
      label: "Net",
      align: "right" as const,
      sortable: true,
      render: (g: WarehouseMovement) => formatNumber(g.net),
    },
  ];

  return (
    <PageLayout
      title="Stock Movement"
      subtitle="Pergerakan stok masuk dan keluar per gudang dari transfer, adjustment, dan pemakaian."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Pergerakan disusun dari tiga sumber: transfer antar gudang (masuk
        berdasarkan qty diterima, keluar berdasarkan qty dikirim), adjustment
        (CR = masuk, DB = keluar), dan pemakaian (usage = keluar). Filter
        tanggal berlaku pada tanggal masing-masing record.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Qty Masuk" value={formatNumber(totalIn)} />
        <StatCard title="Qty Keluar" value={formatNumber(totalOut)} />
        <StatCard
          title="Net Pergerakan"
          value={formatNumber(totalNet)}
        />
        <StatCard
          title="Gudang Teraktif"
          value={formatNumber((topWarehouse?.qtyIn ?? 0) + (topWarehouse?.qtyOut ?? 0))}
          subtitle={topWarehouse?.warehouse}
          accent
        />
      </div>

      <ChartCard
        title="Qty Masuk vs Keluar per Bulan"
        description="Pergerakan stok bulanan (masuk = transfer diterima + adjustment CR)"
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
            <Bar dataKey="in" name="Masuk" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="out" name="Keluar" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
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
        title="stock-movement"
        totalColumns={["count", "qtyIn", "qtyOut"]}
      />
    </PageLayout>
  );
}