import { useMemo } from "react";
import type { ParsedPurchaseOrder } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
  formatPercent,
  formatDate,
  round1,
  warehouseLabel,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
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

interface OpenPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface OpenPOGroup {
  orderNumber: string;
  orderDate: string;
  orderDateObj: Date | null;
  supplierName: string;
  targetWarehouse: string;
  prNumber: string;
  expectedDeliveryDate: string;
  itemCount: number;
  qtyOrdered: number;
  qtyDelivered: number;
  qtyOutstanding: number;
  pctDelivered: number;
  orderNetTotal: number;
}

export default function OpenPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: OpenPOProps) {
  const isMobile = useIsMobile();

  const openGroups = useMemo(() => {
    const grouped: Record<string, ParsedPurchaseOrder[]> = {};
    poItems.forEach((po) => {
      if (po.qtyDelivered === 0 && po.qtyOrdered > 0) {
        if (!grouped[po.orderNumber]) grouped[po.orderNumber] = [];
        grouped[po.orderNumber].push(po);
      }
    });

    return Object.values(grouped)
      .map((lines) => ({
        orderNumber: lines[0].orderNumber,
        orderDate: lines[0].orderDate,
        orderDateObj: lines[0].orderDateObj,
        supplierName: lines[0].supplierName || "-",
        targetWarehouse: warehouseLabel(lines[0].targetWarehouse),
        prNumber: lines[0].prNumber || "-",
        expectedDeliveryDate: lines[0].expectedDeliveryDate,
        itemCount: lines.length,
        qtyOrdered: round1(lines.reduce((sum, l) => sum + l.qtyOrdered, 0)),
        qtyDelivered: 0,
        qtyOutstanding: round1(
          lines.reduce((sum, l) => sum + l.qtyOrdered, 0),
        ),
        pctDelivered: 0,
        orderNetTotal: lines[0].orderNetTotal,
      }))
      .sort(
        (a, b) =>
          (a.orderDateObj?.getTime() ?? 0) -
            (b.orderDateObj?.getTime() ?? 0) ||
          a.orderNumber.localeCompare(b.orderNumber),
      );
  }, [poItems]);

  const totalOutstandingQty = useMemo(
    () => openGroups.reduce((sum, g) => sum + g.qtyOutstanding, 0),
    [openGroups],
  );
  const totalOrderValue = useMemo(
    () => openGroups.reduce((sum, g) => sum + g.orderNetTotal, 0),
    [openGroups],
  );
  const totalItemLines = useMemo(
    () => openGroups.reduce((sum, g) => sum + g.itemCount, 0),
    [openGroups],
  );

  const chartData = useMemo(() => {
    const bySupplier: Record<string, number> = {};
    openGroups.forEach((g) => {
      bySupplier[g.supplierName] =
        (bySupplier[g.supplierName] || 0) + g.orderNetTotal;
    });
    return Object.entries(bySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({
        name:
          name.length > (isMobile ? 13 : 20)
            ? name.substring(0, isMobile ? 13 : 20) + "..."
            : name,
        total,
      }));
  }, [openGroups, isMobile]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      sortable: true,
      render: (g: OpenPOGroup) => formatDate(g.orderDate),
    },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "targetWarehouse", label: "Target Gudang" },
    { key: "itemCount", label: "Jumlah Item", align: "right" as const },
    {
      key: "qtyOutstanding",
      label: "Qty Belum Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: OpenPOGroup) => formatNumber(g.qtyOutstanding),
    },
    {
      key: "pctDelivered",
      label: "% Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: OpenPOGroup) => formatPercent(g.pctDelivered),
    },
    {
      key: "orderNetTotal",
      label: "Nilai PO",
      align: "right" as const,
      sortable: true,
      render: (g: OpenPOGroup) => formatRupiah(g.orderNetTotal),
    },
    {
      key: "expectedDeliveryDate",
      label: "Expected Delivery",
      render: (g: OpenPOGroup) => formatDate(g.expectedDeliveryDate),
    },
    { key: "prNumber", label: "Nomor PR" },
  ];

  return (
    <PageLayout
      title="Open PO"
      subtitle="Laporan PO yang masih aktif/berjalan dan belum menerima pengiriman sama sekali."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        PO dengan status "Active" di dataset tidak selalu berarti belum
        diterima — penilaian status berdasarkan qty penerimaan aktual (qty
        diterima = 0). Filter tanggal berlaku pada tanggal PO.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jumlah PO Terbuka" value={formatNumber(openGroups.length)} />
        <StatCard title="Jumlah Baris Item" value={formatNumber(totalItemLines)} />
        <StatCard title="Total Nilai PO" value={formatRupiah(totalOrderValue)} />
        <StatCard
          title="Qty Belum Diterima"
          value={formatNumber(totalOutstandingQty)}
          accent
        />
      </div>

      <ChartCard
        title="Nilai PO per Supplier (10 Terbesar)"
        description="Supplier dengan nilai PO terbuka tertinggi"
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
              formatter={(value) => [formatRupiah(Number(value)), "Nilai PO"]}
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

      <DataTable
        columns={columns}
        data={openGroups}
        searchable
        searchFields={["orderNumber", "supplierName", "targetWarehouse"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "orderNumber",
          "orderDate",
          "supplierName",
          "itemCount",
          "qtyOutstanding",
          "pctDelivered",
          "orderNetTotal",
        ]}
        title="open-po"
        totalColumns={["qtyOutstanding", "orderNetTotal"]}
      />
    </PageLayout>
  );
}