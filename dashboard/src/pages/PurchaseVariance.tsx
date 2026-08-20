import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import type { DateRange } from "../types/ui";
import { formatNumber, formatPercent, formatDate } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

interface PurchaseVarianceProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface VarianceItem extends ParsedPurchaseItem {
  variance: number;
}

export default function PurchaseVariance({
  items,
  dateRange,
  onDateRangeChange,
}: PurchaseVarianceProps) {
  const varianceData = useMemo(() => {
    return items
      .filter((item) => item.qtyOrdered > 0)
      .map((item) => ({
        ...item,
        variance: item.quantity - item.qtyOrdered,
      }))
      .filter((item) => item.variance !== 0);
  }, [items]);

  const totalRows = useMemo(
    () => items.filter((i) => i.qtyOrdered > 0).length,
    [items],
  );
  const totalVariance = useMemo(
    () => varianceData.reduce((sum, i) => sum + Math.abs(i.variance), 0),
    [varianceData],
  );
  const maxVarianceItem = useMemo(() => {
    if (varianceData.length === 0) return null;
    return varianceData.reduce((max, item) =>
      Math.abs(item.variance) > Math.abs(max.variance) ? item : max,
    );
  }, [varianceData]);

  const variancePercent =
    totalRows > 0 ? (varianceData.length / totalRows) * 100 : 0;

  const columns = [
    {
      key: "purchaseDate",
      label: "Tanggal Purchase",
      sortable: true,
      render: (item: VarianceItem) => formatDate(item.purchaseDate),
    },
    { key: "purchaseNumber", label: "Nomor Purchase", sortable: true },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "qtyOrdered",
      label: "Qty Ordered",
      align: "right" as const,
      render: (item: VarianceItem) => formatNumber(item.qtyOrdered),
    },
    {
      key: "quantity",
      label: "Qty Invoiced",
      align: "right" as const,
      render: (item: VarianceItem) => formatNumber(item.quantity),
    },
    {
      key: "variance",
      label: "Selisih",
      align: "right" as const,
      sortable: true,
      render: (item: VarianceItem) => (
        <span
          className={
            item.variance < 0
              ? "font-medium text-red-600 dark:text-red-400"
              : "font-medium text-emerald-600 dark:text-emerald-400"
          }
        >
          {item.variance > 0 ? "+" : ""}
          {formatNumber(item.variance)}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      title="Purchase Variance"
      subtitle="Analisis selisih antara kuantitas yang dipesan dan kuantitas yang diterima untuk setiap item pembelian."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Baris dengan Variance"
          value={formatNumber(varianceData.length)}
        />
        <StatCard
          title="Total Selisih Kuantitas"
          value={formatNumber(totalVariance)}
        />
        <StatCard
          title="Item dengan Variance Terbesar"
          value={maxVarianceItem?.itemName || "-"}
          subtitle={
            maxVarianceItem
              ? `Selisih: ${formatNumber(maxVarianceItem.variance)}`
              : ""
          }
          accent
        />
        <StatCard
          title="% Baris Bervariance"
          value={formatPercent(variancePercent)}
        />
      </div>

      <DataTable
        columns={columns}
        data={varianceData}
        showExport
        showColumnToggle
        title="variance"
        totalColumns={["qtyOrdered", "quantity", "variance"]}
      />
    </PageLayout>
  );
}
