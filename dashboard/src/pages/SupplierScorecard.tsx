import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import type { DateRange } from "../types/ui";
import { formatNumber, byPurchaseDateAsc } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import InfoBanner from "../components/InfoBanner";
import { Badge } from "@/components/ui/badge";

interface SupplierScorecardProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface SupplierScore {
  supplierName: string;
  priceScore: number;
  timelinessScore: number;
  totalScore: number;
  rating: string;
}

function getRating(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Perlu Perhatian";
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
  const supplierScores = useMemo(() => {
    const grouped: Record<
      string,
      {
        items: ParsedPurchaseItem[];
        priceIncreases: number[];
        overdueDays: number[];
        totalTransactions: number;
      }
    > = {};

    items.forEach((item) => {
      const name = item.supplierName || "-";
      if (!grouped[name]) {
        grouped[name] = {
          items: [],
          priceIncreases: [],
          overdueDays: [],
          totalTransactions: 0,
        };
      }
      grouped[name].items.push(item);
      grouped[name].totalTransactions += 1;
      if (item.poPiOverdueDays > 0) {
        grouped[name].overdueDays.push(item.poPiOverdueDays);
      }
    });

    Object.entries(grouped).forEach(([, data]) => {
      const sorted = data.items
        .filter((i) => i.unitCost > 0)
        .sort(byPurchaseDateAsc);

      for (let i = 1; i < sorted.length; i++) {
        const increase =
          ((sorted[i].unitCost - sorted[i - 1].unitCost) /
            sorted[i - 1].unitCost) *
          100;
        if (increase >= 10) {
          data.priceIncreases.push(increase);
        }
      }
    });

    return Object.entries(grouped)
      .map(([name, data]) => {
        const onTimeTransactions =
          data.totalTransactions - data.overdueDays.length;
        const timelinessScore =
          data.totalTransactions > 0
            ? (onTimeTransactions / data.totalTransactions) * 100
            : 50;

        const priceIncreaseCount = data.priceIncreases.length;
        const avgIncrease =
          data.priceIncreases.length > 0
            ? data.priceIncreases.reduce((a, b) => a + b, 0) /
              data.priceIncreases.length
            : 0;
        const priceScore = Math.max(
          0,
          100 - priceIncreaseCount * 10 - avgIncrease / 2,
        );

        const totalScore = (priceScore + timelinessScore) / 2;

        return {
          supplierName: name,
          priceScore: Math.round(priceScore),
          timelinessScore: Math.round(timelinessScore),
          totalScore: Math.round(totalScore),
          rating: getRating(totalScore),
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [items]);

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

      <DataTable
        columns={columns}
        data={supplierScores}
        showExport
        showColumnToggle
        title="scorecard"
      />
    </PageLayout>
  );
}
