import { useMemo } from "react";
import type { PurchaseOrder, PoLineStatus } from "../types/purchase";
import {
  formatDate,
  formatNumber,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { LucideIcon } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PurchaseOrderStatusProps {
  purchaseOrders: PurchaseOrder[];
  status: PoLineStatus;
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function PurchaseOrderStatus({
  purchaseOrders,
  status,
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  icon,
  dateRange,
  onDateRangeChange,
}: PurchaseOrderStatusProps) {
  const orders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (po.status !== status) return false;
      if (!dateRange.start && !dateRange.end) return true;
      if (!po.orderDate) return false;
      const date = new Date(po.orderDate);
      if (dateRange.start && date < dateRange.start) return false;
      if (dateRange.end && date > dateRange.end) return false;
      return true;
    });
  }, [purchaseOrders, status, dateRange]);

  const stats = useMemo(() => {
    const lineCount = orders.reduce((sum, po) => sum + po.lines.length, 0);
    const totalValue = orders.reduce((sum, po) => sum + po.orderNetTotal, 0);
    const outstandingQty = orders.reduce(
      (sum, po) => sum + po.lines.reduce((s, l) => s + l.qtyOutstanding, 0),
      0,
    );
    const lateCount = orders.filter(
      (po) => po.orderDate && po.expectedDeliveryDate && new Date(po.orderDate) > new Date(po.expectedDeliveryDate),
    ).length;
    return { lineCount, totalValue, outstandingQty, lateCount };
  }, [orders]);

  const supplierChart = useMemo(() => {
    const grouped: Record<string, number> = {};
    orders.forEach((po) => {
      grouped[po.supplierName || "-"] =
        (grouped[po.supplierName || "-"] || 0) + po.orderNetTotal;
    });
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
      }));
  }, [orders]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      render: (po: PurchaseOrder) => formatDate(po.orderDate),
    },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "targetWarehouse", label: "Target Gudang" },
    {
      key: "lineCount",
      label: "Jumlah Item",
      align: "right" as const,
      render: (po: PurchaseOrder) => formatNumber(po.lines.length),
    },
    {
      key: "outstandingQty",
      label: "Qty Belum Diterima",
      align: "right" as const,
      sortable: true,
      render: (po: PurchaseOrder) =>
        formatNumber(
          po.lines.reduce((s, l) => s + l.qtyOutstanding, 0),
        ),
    },
    {
      key: "purchaseOrderPercentDelivered",
      label: "% Diterima",
      align: "right" as const,
      sortable: true,
      render: (po: PurchaseOrder) =>
        formatPercent(po.purchaseOrderPercentDelivered * 100),
    },
    {
      key: "orderNetTotal",
      label: "Nilai PO",
      align: "right" as const,
      sortable: true,
      render: (po: PurchaseOrder) => formatRupiah(po.orderNetTotal),
    },
    {
      key: "expectedDeliveryDate",
      label: "Expected Delivery",
      render: (po: PurchaseOrder) => formatDate(po.expectedDeliveryDate),
    },
    { key: "prNumber", label: "Nomor PR" },
  ];

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      {orders.length === 0 ? (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Jumlah PO" value={formatNumber(orders.length)} />
            <StatCard
              title="Jumlah Baris Item"
              value={formatNumber(stats.lineCount)}
            />
            <StatCard
              title="Total Nilai PO"
              value={formatRupiahCompact(stats.totalValue)}
            />
            <StatCard
              title="Qty Belum Diterima"
              value={formatNumber(stats.outstandingQty)}
              accent={status !== "CLOSED"}
            />
          </div>

          <ChartCard
            title="Nilai PO per Supplier"
            description="10 supplier terbesar berdasarkan nilai PO"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierChart} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatRupiahCompact(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8 }}
                  formatter={(value) => [
                    formatRupiah(Number(value) || 0),
                    "Nilai PO",
                  ]}
                />
                <Bar
                  dataKey="value"
                  fill="var(--color-chart-1)"
                  radius={[0, 4, 4, 0]}
                  name="Nilai PO"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <DataTable columns={columns} data={orders} />
        </>
      )}
    </PageLayout>
  );
}