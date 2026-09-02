import { useMemo } from "react";
import type { ParsedTransfer } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
  formatDate,
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

interface TransferHistoryProps {
  transfers: ParsedTransfer[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function TransferHistory({
  transfers,
  dateRange,
  onDateRangeChange,
}: TransferHistoryProps) {
  const totalQty = useMemo(
    () => transfers.reduce((sum, t) => sum + t.quantity, 0),
    [transfers],
  );
  const totalValue = useMemo(
    () => transfers.reduce((sum, t) => sum + t.lineTotal, 0),
    [transfers],
  );
  const pendingCount = useMemo(
    () => transfers.filter((t) => t.received === "Pending").length,
    [transfers],
  );

  const chartData = useMemo(() => {
    const byMonth: Record<string, { key: string; label: string; total: number }> = {};
    transfers.forEach((t) => {
      const key = monthKeyOf(t.transferDateObj);
      if (!key) return;
      if (!byMonth[key]) {
        byMonth[key] = {
          key,
          label: monthLabelOf(t.transferDateObj),
          total: 0,
        };
      }
      byMonth[key].total += t.quantity;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m) => ({ ...m, total: round1(m.total) }));
  }, [transfers]);

  const columns = [
    { key: "memoNumber", label: "Nomor Memo", sortable: true },
    {
      key: "transferDate",
      label: "Tanggal Transfer",
      sortable: true,
      render: (t: ParsedTransfer) => formatDate(t.transferDate),
    },
    { key: "originWarehouseName", label: "Gudang Asal", sortable: true },
    { key: "destinationWarehouseName", label: "Gudang Tujuan", sortable: true },
    { key: "itemName", label: "Nama Item", sortable: true },
    {
      key: "quantity",
      label: "Qty Dikirim",
      align: "right" as const,
      sortable: true,
      render: (t: ParsedTransfer) => formatNumber(t.quantity),
    },
    {
      key: "receivedQuantity",
      label: "Qty Diterima",
      align: "right" as const,
      sortable: true,
      render: (t: ParsedTransfer) => formatNumber(t.receivedQuantity),
    },
    { key: "received", label: "Status Terima" },
    {
      key: "lineTotal",
      label: "Nilai",
      align: "right" as const,
      sortable: true,
      render: (t: ParsedTransfer) => formatRupiah(t.lineTotal),
    },
  ];

  return (
    <PageLayout
      title="Transfer History"
      subtitle="Riwayat transfer antar gudang (memo transfer) beserta status penerimaannya."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Data berisi seluruh memo transfer aktif (void = Active). Filter tanggal
        berlaku pada tanggal transfer.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Transfer"
          value={formatNumber(transfers.length)}
        />
        <StatCard title="Total Qty" value={formatNumber(totalQty)} />
        <StatCard title="Total Nilai" value={formatRupiah(totalValue)} />
        <StatCard
          title="Belum Diterima"
          value={formatNumber(pendingCount)}
          accent
        />
      </div>

      <ChartCard
        title="Qty Transfer per Bulan"
        description="Total kuantitas yang ditransfer setiap bulan"
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
              formatter={(value) => [
                formatRupiahCompact(Number(value)),
                "Qty",
              ]}
              cursor={{ fill: "var(--color-muted)" }}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable
        columns={columns}
        data={transfers}
        searchable
        searchFields={["memoNumber", "itemName", "originWarehouseName", "destinationWarehouseName"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "memoNumber",
          "transferDate",
          "originWarehouseName",
          "destinationWarehouseName",
          "quantity",
          "receivedQuantity",
          "received",
        ]}
        title="transfer-history"
        totalColumns={["quantity", "receivedQuantity", "lineTotal"]}
      />
    </PageLayout>
  );
}