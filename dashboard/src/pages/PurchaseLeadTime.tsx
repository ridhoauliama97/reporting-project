import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatDate } from "../utils/formatters";
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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PurchaseLeadTimeProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function PurchaseLeadTime({
  items,
  dateRange,
  onDateRangeChange,
}: PurchaseLeadTimeProps) {
  const leadTimeData = useMemo(() => {
    return items.filter(
      (i) => i.requiredPrDays > 0 || i.prPoDays > 0 || i.poPiDays > 0,
    );
  }, [items]);

  const avgDays = (field: "requiredPrDays" | "prPoDays" | "poPiDays") => {
    const valid = items.filter((i) => i[field] > 0);
    return valid.length > 0
      ? valid.reduce((sum, i) => sum + i[field], 0) / valid.length
      : 0;
  };

  const avgRequiredPrDays = avgDays("requiredPrDays");
  const avgPrPoDays = avgDays("prPoDays");
  const avgPoPiDays = avgDays("poPiDays");

  const slowest = useMemo(() => {
    const valid = items.filter((i) => i.poPiDays > 0);
    return valid.length > 0
      ? valid.reduce((max, i) => (i.poPiDays > max.poPiDays ? i : max))
      : null;
  }, [items]);

  const histogramData = useMemo(() => {
    const buckets = [
      { range: "0-3 hari", min: 0, max: 3, count: 0 },
      { range: "4-7 hari", min: 4, max: 7, count: 0 },
      { range: "8-14 hari", min: 8, max: 14, count: 0 },
      { range: "15+ hari", min: 15, max: Infinity, count: 0 },
    ];

    items.forEach((item) => {
      if (item.poPiDays > 0) {
        const bucket = buckets.find(
          (b) => item.poPiDays >= b.min && item.poPiDays <= b.max,
        );
        if (bucket) bucket.count += 1;
      }
    });

    return buckets;
  }, [items]);

  const columns = [
    { key: "prNumber", label: "Nomor PR", sortable: true },
    {
      key: "prDate",
      label: "Tanggal PR",
      render: (item: ParsedPurchaseItem) => formatDate(item.prDate),
    },
    { key: "poNumber", label: "Nomor PO", sortable: true },
    {
      key: "poDate",
      label: "Tanggal PO",
      render: (item: ParsedPurchaseItem) => formatDate(item.poDate),
    },
    { key: "purchaseNumber", label: "Nomor Purchase", sortable: true },
    {
      key: "purchaseDate",
      label: "Tanggal Purchase",
      render: (item: ParsedPurchaseItem) => formatDate(item.purchaseDate),
    },
    {
      key: "requiredPrDays",
      label: "Required→PR (hari)",
      align: "right" as const,
      sortable: true,
      render: (item: ParsedPurchaseItem) =>
        item.requiredPrDays > 0 ? item.requiredPrDays : "-",
    },
    {
      key: "prPoDays",
      label: "PR→PO (hari)",
      align: "right" as const,
      sortable: true,
      render: (item: ParsedPurchaseItem) =>
        item.prPoDays > 0 ? item.prPoDays : "-",
    },
    {
      key: "poPiDays",
      label: "PO→Invoice (hari)",
      align: "right" as const,
      sortable: true,
      render: (item: ParsedPurchaseItem) =>
        item.poPiDays > 0 ? item.poPiDays : "-",
    },
  ];

  return (
    <PageLayout
      title="Supplier Lead Time"
      subtitle="Analisis lead time tiga tahap: tanggal diperlukan (Required) → Purchase Request (PR) → Purchase Order (PO) → Invoice."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Menggunakan data asli PR, PO, dan invoice. Rentang filter berlaku pada
        tanggal purchase (invoice).
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Rata-rata Required→PR"
          value={`${avgRequiredPrDays.toFixed(1)} hari`}
        />
        <StatCard
          title="Rata-rata PR→PO"
          value={`${avgPrPoDays.toFixed(1)} hari`}
        />
        <StatCard
          title="Rata-rata PO→Invoice"
          value={`${avgPoPiDays.toFixed(1)} hari`}
        />
        <StatCard
          title="Lead Time PO→Invoice Terlama"
          value={slowest ? `${slowest.poPiDays} hari` : "-"}
          subtitle={slowest?.purchaseNumber}
          accent
        />
      </div>

      <ChartCard
        title="Distribusi Lead Time PO → Invoice"
        description="Histogram jumlah transaksi per rentang hari"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="range"
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar
              dataKey="count"
              fill="var(--color-chart-2)"
              radius={[4, 4, 0, 0]}
              name="Jumlah Transaksi"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable columns={columns} data={leadTimeData} />
    </PageLayout>
  );
}