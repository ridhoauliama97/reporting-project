import { useMemo } from "react";
import type {
  StockBalance,
  UsageItem,
  GoodsTransfer,
  AdjustmentItem,
} from "../types/purchase";
import {
  formatDate,
  formatNumber,
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
import { WarehouseIcon } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface WarehouseReportProps {
  name: string;
  stockBalances: StockBalance[];
  usage: UsageItem[];
  goodsTransfers: GoodsTransfer[];
  adjustments: AdjustmentItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function inRange(dateStr: string, start: Date | null, end: Date | null) {
  if (!start && !end) return true;
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export default function WarehouseReport({
  name,
  stockBalances,
  usage,
  goodsTransfers,
  adjustments,
  dateRange,
  onDateRangeChange,
}: WarehouseReportProps) {
  const code = useMemo(() => {
    const match = /^(\d+)\s*:/.exec(name);
    return match ? match[1] : "";
  }, [name]);

  const stock = useMemo(
    () => stockBalances.filter((s) => s.warehouseCode === code),
    [stockBalances, code],
  );
  const usageRows = useMemo(
    () =>
      usage
        .filter(
          (u) =>
            u.warehouseCode === code &&
            inRange(u.usageDate, dateRange.start, dateRange.end),
        )
        .sort((a, b) => b.usageDate.localeCompare(a.usageDate)),
    [usage, code, dateRange],
  );
  const transferRows = useMemo(
    () =>
      goodsTransfers
        .filter(
          (t) =>
            (t.originWarehouseCode === code ||
              t.destinationWarehouseCode === code) &&
            inRange(t.transferDate, dateRange.start, dateRange.end),
        )
        .sort((a, b) => b.transferDate.localeCompare(a.transferDate)),
    [goodsTransfers, code, dateRange],
  );
  const adjustmentRows = useMemo(
    () =>
      adjustments
        .filter(
          (a) =>
            a.warehouseCode === code &&
            inRange(a.adjustmentDate, dateRange.start, dateRange.end),
        )
        .sort((a, b) => b.adjustmentDate.localeCompare(a.adjustmentDate)),
    [adjustments, code, dateRange],
  );

  const stats = useMemo(() => {
    const totalOnHand = stock.reduce((s, r) => s + r.onHand, 0);
    const totalValue = stock.reduce(
      (s, r) => s + r.onHand * r.lastPurchaseCost,
      0,
    );
    const usageCost = usageRows.reduce((s, r) => s + r.totalCost, 0);
    const usageQty = usageRows.reduce((s, r) => s + r.quantity, 0);
    return { totalOnHand, totalValue, usageCost, usageQty };
  }, [stock, usageRows]);

  const categoryChart = useMemo(() => {
    const grouped: Record<string, number> = {};
    stock.forEach((s) => {
      grouped[s.itemCategory || "-"] =
        (grouped[s.itemCategory || "-"] || 0) + s.onHand;
    });
    return Object.entries(grouped)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [stock]);

  const stockColumns = [
    { key: "itemCode", label: "Kode Item", sortable: true },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "itemCategory", label: "Kategori" },
    { key: "uom", label: "Satuan" },
    {
      key: "onHand",
      label: "On Hand",
      align: "right" as const,
      sortable: true,
      render: (s: StockBalance) => formatNumber(s.onHand),
    },
    {
      key: "lastPurchaseCost",
      label: "Harga Beli Terakhir",
      align: "right" as const,
      render: (s: StockBalance) => formatRupiah(s.lastPurchaseCost),
    },
    {
      key: "stockValue",
      label: "Nilai Stok",
      align: "right" as const,
      sortable: true,
      render: (s: StockBalance) =>
        formatRupiah(s.onHand * s.lastPurchaseCost),
    },
  ];

  const usageColumns = [
    {
      key: "usageDate",
      label: "Tanggal",
      sortable: true,
      render: (u: UsageItem) => formatDate(u.usageDate),
    },
    { key: "usageNumber", label: "No. Usage" },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "itemCategory", label: "Kategori" },
    {
      key: "quantity",
      label: "Qty",
      align: "right" as const,
      render: (u: UsageItem) => formatNumber(u.quantity),
    },
    { key: "uom", label: "Satuan" },
    {
      key: "totalCost",
      label: "Total Cost",
      align: "right" as const,
      sortable: true,
      render: (u: UsageItem) => formatRupiah(u.totalCost),
    },
    { key: "requestedBy", label: "Pemohon" },
  ];

  const transferColumns = [
    {
      key: "transferDate",
      label: "Tanggal",
      sortable: true,
      render: (t: GoodsTransfer) => formatDate(t.transferDate),
    },
    { key: "memoNumber", label: "No. Memo" },
    { key: "transferType", label: "Tipe" },
    {
      key: "originWarehouse",
      label: "Asal",
      render: (t: GoodsTransfer) => t.originWarehouse || "-",
    },
    {
      key: "destinationWarehouse",
      label: "Tujuan",
      render: (t: GoodsTransfer) => t.destinationWarehouse || "-",
    },
    { key: "itemName", label: "Nama Item" },
    {
      key: "quantity",
      label: "Qty",
      align: "right" as const,
      render: (t: GoodsTransfer) => formatNumber(t.quantity),
    },
    { key: "received", label: "Status" },
  ];

  const adjustmentColumns = [
    {
      key: "adjustmentDate",
      label: "Tanggal",
      sortable: true,
      render: (a: AdjustmentItem) => formatDate(a.adjustmentDate),
    },
    { key: "memoNumber", label: "No. Memo" },
    { key: "adjustmentType", label: "Tipe" },
    { key: "itemName", label: "Nama Item", sortable: true },
    {
      key: "qtyDb",
      label: "Qty (DB)",
      align: "right" as const,
      render: (a: AdjustmentItem) => formatNumber(a.qtyDb),
    },
    {
      key: "qtyCr",
      label: "Qty (CR)",
      align: "right" as const,
      render: (a: AdjustmentItem) => formatNumber(a.qtyCr),
    },
    {
      key: "adjustedValue",
      label: "Nilai Penyesuaian",
      align: "right" as const,
      render: (a: AdjustmentItem) => formatRupiah(a.adjustedValue),
    },
  ];

  const sortedStock = useMemo(
    () => [...stock].sort((a, b) => b.onHand - a.onHand),
    [stock],
  );

  return (
    <PageLayout
      title={name}
      subtitle={`Stok, pemakaian, transfer, dan penyesuaian untuk ${name}.`}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      {sortedStock.length === 0 && usageRows.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title={name}
          description="Belum ada data stok atau aktivitas untuk gudang ini pada sumber data."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Jumlah Item Stok"
              value={formatNumber(sortedStock.length)}
            />
            <StatCard
              title="Total On Hand"
              value={formatNumber(stats.totalOnHand)}
            />
            <StatCard
              title="Nilai Stok"
              value={formatRupiahCompact(stats.totalValue)}
            />
            <StatCard
              title="Pemakaian (Total Cost)"
              value={formatRupiahCompact(stats.usageCost)}
              subtitle={`${formatNumber(usageRows.length)} baris, ${formatNumber(stats.usageQty)} unit`}
              accent
            />
          </div>

          {sortedStock.length > 0 && (
            <>
              <ChartCard
                title="Saldo Stok per Kategori"
                description="Distribusi on hand berdasarkan kategori item"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart}>
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
                      dy={8}
                      interval={0}
                      angle={-15}
                      height={60}
                    />
                    <YAxis
                      className="text-xs text-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-chart-1)"
                      radius={[4, 4, 0, 0]}
                      name="On Hand"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <DataTable columns={stockColumns} data={sortedStock} />
            </>
          )}

          {usageRows.length > 0 && (
            <DataTable
              columns={usageColumns}
              data={usageRows}
              title="Pemakaian Barang"
            />
          )}

          {transferRows.length > 0 && (
            <DataTable
              columns={transferColumns}
              data={transferRows}
              title="Transfer Antar Gudang"
            />
          )}

          {adjustmentRows.length > 0 && (
            <DataTable
              columns={adjustmentColumns}
              data={adjustmentRows}
              title="Penyesuaian Stok"
            />
          )}
        </>
      )}
    </PageLayout>
  );
}