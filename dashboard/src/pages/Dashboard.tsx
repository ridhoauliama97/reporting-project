
import type { DateRange } from "../types/ui";import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ParsedPurchaseItem } from "@/types/purchase";
import { ITEM_CATEGORIES, CATEGORY_LABELS } from "@/types/purchase";
import { formatRupiah, formatNumber, formatPercent } from "@/utils/formatters";
import { generateOverallSummary, priceIncreaseAlerts } from "@/utils/analytics";
import PageLayout from "../components/PageLayout";
import { SectionCards } from "../components/dashboard/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  Building2Icon,
  LayersIcon,
  SparklesIcon,
  TimerIcon,
  TrendingUpIcon,
  TruckIcon,
} from "lucide-react";

interface DashboardProps {
  items: ParsedPurchaseItem[];
  allItems: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface PreviewRow {
  key: string;
  label: string;
  sublabel?: string;
  value: string;
  valueClass?: string;
}

interface PreviewCardProps {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  title: string;
  description: string;
  to: string;
  rows: PreviewRow[];
  emptyText: string;
}

function PreviewCard({
  icon: Icon,
  accent,
  title,
  description,
  to,
  rows,
  emptyText,
}: PreviewCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${accent}`}
            >
              <Icon className="size-4" />
            </span>
            {title}
          </CardTitle>
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Lihat Laporan
            <ArrowRightIcon className="size-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 text-sm">
        {rows.length === 0 ? (
          <p className="text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {rows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="truncate">{row.label}</div>
                  {row.sublabel && (
                    <div className="truncate text-xs text-muted-foreground">
                      {row.sublabel}
                    </div>
                  )}
                </div>
                <span
                  className={`shrink-0 font-medium tabular-nums ${
                    row.valueClass ?? ""
                  }`}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function Dashboard({
  items,
  allItems,
  dateRange,
  onDateRangeChange,
}: DashboardProps) {
  const prevItems = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return undefined;
    const len = dateRange.end.getTime() - dateRange.start.getTime();
    const prevStart = new Date(dateRange.start.getTime() - len - 86400000);
    const prevEnd = new Date(dateRange.start.getTime() - 86400000);
    return allItems.filter(
      (item) =>
        item.purchaseDateObj !== null &&
        item.purchaseDateObj >= prevStart &&
        item.purchaseDateObj <= prevEnd,
    );
  }, [allItems, dateRange]);

  const overallSummary = useMemo(
    () => generateOverallSummary(items, allItems),
    [items, allItems],
  );

  const previews = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    ITEM_CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });
    const supplierTotals: Record<string, number> = {};
    const supplierOverdue: Record<string, { count: number; days: number[] }> =
      {};
    const supplierLead: Record<string, number[]> = {};

    items.forEach((item) => {
      const cat = item.itemCategory as string;
      if (categoryTotals[cat] !== undefined)
        categoryTotals[cat] += item.netTotal;

      const name = item.supplierName || "-";
      supplierTotals[name] = (supplierTotals[name] || 0) + item.netTotal;
      if (item.poPiOverdueDays > 0) {
        if (!supplierOverdue[name])
          supplierOverdue[name] = { count: 0, days: [] };
        supplierOverdue[name].count += 1;
        supplierOverdue[name].days.push(item.poPiOverdueDays);
      }
      if (item.poPiDays > 0) {
        if (!supplierLead[name]) supplierLead[name] = [];
        supplierLead[name].push(item.poPiDays);
      }
    });

    const alertRows = priceIncreaseAlerts(items)
      .slice(0, 5)
      .map((a) => ({
        key: `alert-${a.item}`,
        label: a.item,
        sublabel: `${formatRupiah(a.prev)} → ${formatRupiah(a.curr)} per unit`,
        value: `+${formatPercent(a.increase * 100)}`,
        valueClass: "text-red-600 dark:text-red-400",
      }));

    const varianceRows = items
      .filter((i) => i.qtyOrdered > 0)
      .map((i) => ({
        key: i.purchaseNumber,
        item: i,
        variance: i.quantity - i.qtyOrdered,
      }))
      .filter((r) => r.variance !== 0)
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 5)
      .map((r, i) => ({
        key: `var-${i}`,
        label: r.item.purchaseNumber,
        sublabel: r.item.itemName,
        value: `${formatNumber(r.variance)} unit`,
      }));

    return {
      categoryRows: Object.entries(categoryTotals)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, value]) => ({
          key: `cat-${cat}`,
          label: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat,
          value: formatRupiah(value),
        })),
      supplierRows: Object.entries(supplierTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], idx) => ({
          key: `sup-${name}`,
          label: `${idx + 1}. ${name}`,
          value: formatRupiah(value),
        })),
      overdueRows: Object.entries(supplierOverdue)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([name, d]) => ({
          key: `over-${name}`,
          label: name,
          sublabel: `rata-rata ${formatNumber(Math.round(d.days.reduce((a, b) => a + b, 0) / d.days.length))} hari keterlambatan`,
          value: `${formatNumber(d.count)}x`,
        })),
      leadRows: Object.entries(supplierLead)
        .map(([name, days]) => ({
          name,
          avg: days.reduce((a, b) => a + b, 0) / days.length,
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5)
        .map(({ name, avg }) => ({
          key: `lead-${name}`,
          label: name,
          sublabel: `rata-rata PO → Invoice`,
          value: `${formatNumber(Math.round(avg * 10) / 10)} hari`,
        })),
      alertRows,
      varianceRows,
    };
  }, [items]);

  return (
    <PageLayout
      title={`${getGreeting()}, User. 👋`}
      subtitle="Here's a quick overview of your purchasing data."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <SectionCards items={items} prevItems={prevItems} />

      <Card className="border-teal-500/30 bg-linear-to-t from-teal-500/5 to-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
              <SparklesIcon className="size-4 text-teal-600 dark:text-teal-400" />
            </span>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Ai Generated Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Rangkuman ini otomatis diperbarui sesuai rentang tanggal aktif
                yang dipilih
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {overallSummary}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PreviewCard
          icon={LayersIcon}
          accent="bg-teal-500/10 text-teal-600 dark:text-teal-400"
          title="Purchase Summary"
          description="Distribusi nilai pembelian per kategori pada periode aktif."
          to="/summary"
          rows={previews.categoryRows}
          emptyText="Tidak ada transaksi pada periode ini."
        />

        <PreviewCard
          icon={Building2Icon}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          title="Supplier Ranking"
          description="Supplier dengan total nilai pembelian terbesar pada periode aktif."
          to="/ranking"
          rows={previews.supplierRows}
          emptyText="Tidak ada transaksi pada periode ini."
        />

        <PreviewCard
          icon={TruckIcon}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Supplier Delivery Performance"
          description="Supplier dengan keterlambatan PO → Invoice terbanyak pada periode aktif."
          to="/delivery"
          rows={previews.overdueRows}
          emptyText="Tidak ada keterlambatan pada periode ini."
        />

        <PreviewCard
          icon={TimerIcon}
          accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          title="Supplier Lead Time"
          description="Supplier dengan rata-rata lead time PO → Invoice terlama pada periode aktif."
          to="/lead-time"
          rows={previews.leadRows}
          emptyText="Tidak ada data durasi PO → Invoice pada periode ini."
        />

        <PreviewCard
          icon={AlertTriangleIcon}
          accent="bg-red-500/10 text-red-600 dark:text-red-400"
          title="Price Increase Alert"
          description="Item dengan kenaikan harga berurutan ≥ 10% pada periode aktif."
          to="/price-alert"
          rows={previews.alertRows}
          emptyText="Tidak ada kenaikan harga berurutan ≥ 10%."
        />

        <PreviewCard
          icon={TrendingUpIcon}
          accent="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          title="Purchase Variance"
          description="Transaksi dengan selisih qty terhadap qty pesanan pada periode aktif."
          to="/variance"
          rows={previews.varianceRows}
          emptyText="Semua transaksi sesuai qty pesanan."
        />
      </div>
    </PageLayout>
  );
}
