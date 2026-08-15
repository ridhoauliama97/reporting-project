import { useMemo, useState } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatRupiah, formatPercent, formatDate } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PriceIncreaseAlertProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface PriceIncreaseItem {
  itemName: string;
  supplierName: string;
  previousDate: string;
  previousPrice: number;
  latestDate: string;
  latestPrice: number;
  increasePercent: number;
}

export default function PriceIncreaseAlert({
  items,
  dateRange,
  onDateRangeChange,
}: PriceIncreaseAlertProps) {
  const [threshold, setThreshold] = useState(10);

  const flaggedItems = useMemo(() => {
    const grouped: Record<string, ParsedPurchaseItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.itemName]) {
        grouped[item.itemName] = [];
      }
      grouped[item.itemName].push(item);
    });

    const result: PriceIncreaseItem[] = [];

    Object.entries(grouped).forEach(([itemName, itemGroup]) => {
      const sorted = itemGroup
        .filter((i) => i.unitCost > 0)
        .sort(
          (a, b) =>
            new Date(a.purchaseDate).getTime() -
            new Date(b.purchaseDate).getTime(),
        );

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const increase =
          ((curr.unitCost - prev.unitCost) / prev.unitCost) * 100;

        if (increase >= threshold) {
          result.push({
            itemName,
            supplierName: curr.supplierName,
            previousDate: prev.purchaseDate,
            previousPrice: prev.unitCost,
            latestDate: curr.purchaseDate,
            latestPrice: curr.unitCost,
            increasePercent: increase,
          });
        }
      }
    });

    return result.sort((a, b) => b.increasePercent - a.increasePercent);
  }, [items, threshold]);

  const avgIncrease =
    flaggedItems.length > 0
      ? flaggedItems.reduce((sum, i) => sum + i.increasePercent, 0) /
        flaggedItems.length
      : 0;

  const maxIncrease = flaggedItems[0];

  const monitoredItems = useMemo(() => {
    const itemSet = new Set(
      items.filter((i) => i.unitCost > 0).map((i) => i.itemName),
    );
    return itemSet.size;
  }, [items]);

  const columns = [
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "previousDate",
      label: "Tanggal Sebelumnya",
      render: (item: PriceIncreaseItem) => formatDate(item.previousDate),
    },
    {
      key: "previousPrice",
      label: "Harga Sebelumnya",
      align: "right" as const,
      render: (item: PriceIncreaseItem) => formatRupiah(item.previousPrice),
    },
    {
      key: "latestDate",
      label: "Tanggal Terbaru",
      render: (item: PriceIncreaseItem) => formatDate(item.latestDate),
    },
    {
      key: "latestPrice",
      label: "Harga Terbaru",
      align: "right" as const,
      render: (item: PriceIncreaseItem) => formatRupiah(item.latestPrice),
    },
    {
      key: "increasePercent",
      label: "Kenaikan (%)",
      align: "right" as const,
      sortable: true,
      render: (item: PriceIncreaseItem) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            item.increasePercent >= 20
              ? "bg-red-100 text-red-700"
              : item.increasePercent >= 15
                ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {formatPercent(item.increasePercent)}
        </span>
      ),
    },
  ];

  return (
    <PageLayout
      title="Price Increase Alert"
      subtitle="Daftar item yang mengalami kenaikan harga signifikan dalam periode tertentu."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Item Naik Harga"
          value={String(flaggedItems.length)}
        />
        <StatCard
          title="Rata-rata Kenaikan"
          value={formatPercent(avgIncrease)}
        />
        <StatCard
          title="Kenaikan Tertinggi"
          value={maxIncrease ? formatPercent(maxIncrease.increasePercent) : "-"}
          subtitle={maxIncrease?.itemName}
          accent
        />
        <StatCard title="Item Terpantau" value={String(monitoredItems)} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-muted-foreground">
            Threshold Kenaikan (%)
          </label>
          <Input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={1}
            max={100}
            className="h-11 w-full sm:h-9 sm:w-32"
          />
        </CardContent>
      </Card>

      <DataTable columns={columns} data={flaggedItems} />
    </PageLayout>
  );
}
