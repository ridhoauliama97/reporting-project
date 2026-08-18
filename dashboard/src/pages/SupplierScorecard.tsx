import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatNumber } from "../utils/formatters";
import {
  computeSupplierScores,
  type SupplierScore,
} from "../utils/analytics";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import InfoBanner from "../components/InfoBanner";
import { Badge } from "@/components/ui/badge";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SupplierScorecardProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

function getRatingColor(rating: string): string {
  if (rating === "Excellent")
    return "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400";
  if (rating === "Good")
    return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
  return "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400";
}

export default function SupplierScorecard({
  items,
  dateRange,
  onDateRangeChange,
}: SupplierScorecardProps) {
  const supplierScores = useMemo(
    () => computeSupplierScores(items),
    [items],
  );

  const topSupplier = supplierScores[0];
  const bottomSupplier = supplierScores[supplierScores.length - 1];
  const avgScore =
    supplierScores.length > 0
      ? supplierScores.reduce((sum, s) => sum + s.totalScore, 0) /
        supplierScores.length
      : 0;

  const columns = [
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "priceScore",
      label: "Skor Harga",
      align: "center" as const,
      sortable: true,
      render: (item: SupplierScore) => `${item.priceScore}/100`,
    },
    {
      key: "timelinessScore",
      label: "Skor Ketepatan Waktu",
      align: "center" as const,
      sortable: true,
      render: (item: SupplierScore) => `${item.timelinessScore}/100`,
    },
    {
      key: "totalScore",
      label: "Skor Total",
      align: "center" as const,
      sortable: true,
      render: (item: SupplierScore) => `${item.totalScore}/100`,
    },
    {
      key: "rating",
      label: "Rating",
      align: "center" as const,
      render: (item: SupplierScore) => (
        <Badge variant="outline" className={getRatingColor(item.rating)}>
          {item.rating}
        </Badge>
      ),
    },
  ];

  return (
    <PageLayout
      title="Supplier Scorecard"
      subtitle="Laporan skor kinerja supplier berdasarkan kriteria harga dan ketepatan waktu."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Skor berbasis Harga & Ketepatan Waktu — dimensi Kualitas belum tersedia.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Supplier Skor Tertinggi"
          value={topSupplier ? `${topSupplier.totalScore}/100` : "-"}
          subtitle={topSupplier?.supplierName}
        />
        <StatCard
          title="Supplier Skor Terendah"
          value={bottomSupplier ? `${bottomSupplier.totalScore}/100` : "-"}
          subtitle={bottomSupplier?.supplierName}
          accent
        />
        <StatCard
          title="Rata-rata Skor Total"
          value={`${avgScore.toFixed(0)}/100`}
        />
        <StatCard
          title="Jumlah Supplier Dinilai"
          value={formatNumber(supplierScores.length)}
        />
      </div>

      <DataTable columns={columns} data={supplierScores} />
    </PageLayout>
  );
}
