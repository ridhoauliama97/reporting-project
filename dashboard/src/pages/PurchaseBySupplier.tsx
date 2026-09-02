import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import type { DateRange } from "../types/ui";
import { formatRupiah, formatNumber, formatPercent } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

interface PurchaseBySupplierProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface SupplierData {
  supplierName: string;
  transactionCount: number;
  totalQuantity: number;
  totalPurchase: number;
  percentOfGrand: number;
}

export default function PurchaseBySupplier({
  items,
  dateRange,
  onDateRangeChange,
}: PurchaseBySupplierProps) {
  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.netTotal, 0),
    [items],
  );

  const supplierData = useMemo(() => {
    const grouped: Record<string, SupplierData> = {};

    items.forEach((item) => {
      const name = item.supplierName || "-";
      if (!grouped[name]) {
        grouped[name] = {
          supplierName: name,
          transactionCount: 0,
          totalQuantity: 0,
          totalPurchase: 0,
          percentOfGrand: 0,
        };
      }
      grouped[name].transactionCount += 1;
      grouped[name].totalQuantity += item.quantity;
      grouped[name].totalPurchase += item.netTotal;
    });

    const result = Object.values(grouped).map((s) => ({
      ...s,
      percentOfGrand: grandTotal > 0 ? (s.totalPurchase / grandTotal) * 100 : 0,
    }));

    return result.sort((a, b) => b.totalPurchase - a.totalPurchase);
  }, [items, grandTotal]);

  const topSupplier = supplierData[0];
  const avgPerSupplier =
    supplierData.length > 0 ? grandTotal / supplierData.length : 0;

  const columns = [
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "transactionCount",
      label: "Jumlah Transaksi",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "totalQuantity",
      label: "Total Kuantitas",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierData) => formatNumber(item.totalQuantity),
    },
    {
      key: "totalPurchase",
      label: "Total Pembelian",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierData) => formatRupiah(item.totalPurchase),
    },
    {
      key: "percentOfGrand",
      label: "% dari Grand Total",
      align: "right" as const,
      sortable: true,
      render: (item: SupplierData) => formatPercent(item.percentOfGrand),
    },
  ];

  return (
    <PageLayout
      title="Purchase by Supplier"
      subtitle="Ringkasan pembelian berdasarkan supplier, termasuk jumlah transaksi, total kuantitas, dan total pembelian."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pembelian" value={formatRupiah(grandTotal)} />
        <StatCard
          title="Jumlah Supplier Aktif"
          value={formatNumber(supplierData.length)}
        />
        <StatCard
          title="Rata-rata per Supplier"
          value={formatRupiah(avgPerSupplier)}
        />
        <StatCard
          title="Supplier Terbesar"
          value={topSupplier ? formatRupiah(topSupplier.totalPurchase) : "-"}
          subtitle={topSupplier?.supplierName}
          accent
        />
      </div>
      <DataTable
        columns={columns}
        data={supplierData}
        showExport
        showColumnToggle
        title="by-supplier"
        totalColumns={["transactionCount", "totalQuantity", "totalPurchase"]}
      />
    </PageLayout>
  );
}
