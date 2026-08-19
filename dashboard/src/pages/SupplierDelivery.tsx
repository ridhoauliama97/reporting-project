import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatNumber, formatPercent } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import InfoBanner from "../components/InfoBanner";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SupplierDeliveryProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface SupplierDeliveryData {
  supplierName: string;
  avgPoPiDays: number;
  avgOverdueDays: number;
  lateCount: number;
  totalCount: number;
}

export default function SupplierDelivery({
  items,
  dateRange,
  onDateRangeChange,
}: SupplierDeliveryProps) {
  const supplierData = useMemo(() => {
    const grouped: Record<
      string,
      {
        poPiDays: number[];
        overdueDays: number[];
        lateCount: number;
        totalCount: number;
      }
    > = {};

    items.forEach((item) => {
      const name = item.supplierName || "-";
      if (!grouped[name]) {
        grouped[name] = {
          poPiDays: [],
          overdueDays: [],
          lateCount: 0,
          totalCount: 0,
        };
      }
      if (item.poPiDays > 0) {
        grouped[name].poPiDays.push(item.poPiDays);
      }
      if (item.poPiOverdueDays > 0) {
        grouped[name].overdueDays.push(item.poPiOverdueDays);
        grouped[name].lateCount += 1;
      }
      grouped[name].totalCount += 1;
    });

    return Object.entries(grouped)
      .map(([name, data]) => ({
        supplierName: name,
        avgPoPiDays:
          data.poPiDays.length > 0
            ? data.poPiDays.reduce((a, b) => a + b, 0) / data.poPiDays.length
            : 0,
        avgOverdueDays:
          data.overdueDays.length > 0
            ? data.overdueDays.reduce((a, b) => a + b, 0) /
              data.overdueDays.length
            : 0,
        lateCount: data.lateCount,
        totalCount: data.totalCount,
      }))
      .sort((a, b) => b.avgOverdueDays - a.avgOverdueDays);
  }, [items]);

  const totalLate = useMemo(
    () => items.filter((i) => i.poPiOverdueDays > 0).length,
    [items],
  );
  const onTimePercent =
    items.length > 0 ? ((items.length - totalLate) / items.length) * 100 : 0;
  const avgPoPiDays = useMemo(() => {
    const valid = items.filter((i) => i.poPiDays > 0);
    return valid.length > 0
      ? valid.reduce((sum, i) => sum + i.poPiDays, 0) / valid.length
      : 0;
  }, [items]);

  const slowestSupplier = supplierData[0];

  const columns = [
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "avgPoPiDays",
      label: "Rata-rata Hari PO→Invoice",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierDeliveryData) => item.avgPoPiDays.toFixed(1),
    },
    {
      key: "avgOverdueDays",
      label: "Rata-rata Hari Overdue",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierDeliveryData) => item.avgOverdueDays.toFixed(1),
    },
    {
      key: "lateCount",
      label: "Jumlah Transaksi Terlambat",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "totalCount",
      label: "Jumlah Transaksi Total",
      align: "right" as const,
      sortable: true,
    },
  ];

  return (
    <PageLayout
      title="Supplier Delivery Performance"
      subtitle="Laporan kinerja pengiriman supplier berdasarkan data pembelian."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Diukur dari selisih PO ke Invoice, karena data tanggal barang diterima
        belum tersedia.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Rata-rata Hari PO→Invoice"
          value={avgPoPiDays.toFixed(1)}
        />
        <StatCard
          title="Jumlah Transaksi Terlambat"
          value={formatNumber(totalLate)}
        />
        <StatCard title="% Tepat Waktu" value={formatPercent(onTimePercent)} />
        <StatCard
          title="Supplier Paling Lambat"
          value={slowestSupplier?.supplierName || "-"}
          subtitle={
            slowestSupplier
              ? `${slowestSupplier.avgOverdueDays.toFixed(1)} hari overdue`
              : ""
          }
          accent
        />
      </div>

      <DataTable
        columns={columns}
        data={supplierData}
        showExport
        showColumnToggle
        title="supplier-delivery"
        totalColumns={["lateCount", "totalCount"]}
      />
    </PageLayout>
  );
}
