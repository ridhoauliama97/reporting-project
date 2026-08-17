import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ParsedPurchaseItem } from "@/types/purchase";
import { ITEM_CATEGORIES, CATEGORY_LABELS } from "@/types/purchase";
import {
  formatNumber,
  formatPercent,
  formatRupiahCompact,
} from "@/utils/formatters";
import {
  generateOverallSummary,
  priceIncreaseAlerts,
} from "@/utils/analytics";
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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DashboardProps {
  items: ParsedPurchaseItem[];
  allItems: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface PreviewCardProps {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  title: string;
  to: string;
  children: React.ReactNode;
}

function PreviewCard({ icon: Icon, accent, title, to, children }: PreviewCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${accent}`}
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
      </CardHeader>
      <CardContent className="flex-1 pb-4 text-sm">{children}</CardContent>
    </Card>
  );
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
    return allItems.filter((item) => {
      const d = new Date(item.purchaseDate);
      return d >= prevStart && d <= prevEnd;
    });
  }, [allItems, dateRange]);

  const overallSummary = useMemo(
    () => generateOverallSummary(items, allItems),
    [items, allItems],
  );

  const stats = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    ITEM_CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });
    const supplierTotals: Record<string, number> = {};
    const supplierOverdue: Record<string, { count: number; days: number[] }> =
      {};
    let leadCount = 0;
    let leadPrSum = 0;
    let leadPoSum = 0;
    let overdueTotal = 0;
    let varianceCount = 0;
    let varianceDiff = 0;

    items.forEach((item) => {
      const cat = item.itemCategory as string;
      if (categoryTotals[cat] !== undefined) categoryTotals[cat] += item.netTotal;

      const name = item.supplierName || "-";
      supplierTotals[name] = (supplierTotals[name] || 0) + item.netTotal;
      if (item.poPiOverdueDays > 0) {
        overdueTotal += 1;
        if (!supplierOverdue[name]) supplierOverdue[name] = { count: 0, days: [] };
        supplierOverdue[name].count += 1;
        supplierOverdue[name].days.push(item.poPiOverdueDays);
      }

      if (item.prPiDays > 0 || item.poPiDays > 0) {
        leadCount += 1;
        if (item.prPiDays > 0) leadPrSum += item.prPiDays;
        if (item.poPiDays > 0) leadPoSum += item.poPiDays;
      }

      if (item.qtyOrdered > 0) {
        const variance = item.quantity - item.qtyOrdered;
        if (variance !== 0) {
          varianceCount += 1;
          varianceDiff += variance;
        }
      }
    });

    const topSuppliers = Object.entries(supplierTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const total = items.reduce((s, i) => s + i.netTotal, 0);
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .filter(([, v]) => v > 0)[0];
    const worstOverdue = Object.entries(supplierOverdue)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);
    const alerts = priceIncreaseAlerts(items);
    const topAlert = alerts[0];

    return {
      categoryTotals,
      topCategory,
      topSuppliers,
      total,
      overdueTotal,
      worstOverdue,
      avgPr: leadCount > 0 ? leadPrSum / leadCount : 0,
      avgPo: leadCount > 0 ? leadPoSum / leadCount : 0,
      alerts,
      topAlert,
      varianceCount,
      varianceDiff,
    };
  }, [items]);

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Rangkuman statistik keseluruhan laporan purchasing dan insight utama."
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
                Ringkasan AI Keseluruhan
              </CardTitle>
              <CardDescription className="text-xs">
                Otomatis diperbarui mengikuti rentang tanggal aktif
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
          title="Kategori Pembelian"
          to="/summary"
        >
          <div className="flex flex-col gap-1.5">
            {Object.entries(stats.categoryTotals)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, value]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate text-muted-foreground">
                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatRupiahCompact(value)}
                  </span>
                </div>
              ))}
          </div>
        </PreviewCard>

        <PreviewCard
          icon={Building2Icon}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          title="Supplier Terbesar"
          to="/ranking"
        >
          <div className="flex flex-col gap-1.5">
            {stats.topSuppliers.map(([name, value], idx) => (
              <div
                key={name}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate text-muted-foreground">
                  <span className="mr-1.5 font-semibold text-foreground">
                    {idx + 1}.
                  </span>
                  {name}
                </span>
                <span className="font-medium tabular-nums">
                  {formatRupiahCompact(value)}
                </span>
              </div>
            ))}
          </div>
        </PreviewCard>

        <PreviewCard
          icon={TruckIcon}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Keterlambatan Pengiriman"
          to="/delivery"
        >
          {stats.overdueTotal === 0 ? (
            <p className="text-muted-foreground">
              Tidak ada keterlambatan pada periode ini.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="font-medium">
                {formatNumber(stats.overdueTotal)} transaksi terlambat
              </p>
              {stats.worstOverdue.map(([name, d]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-2 text-muted-foreground"
                >
                  <span className="truncate">{name}</span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(d.count)}x ·{" "}
                    {formatNumber(Math.round(d.days.reduce((a, b) => a + b, 0) / d.days.length))} hari
                  </span>
                </div>
              ))}
            </div>
          )}
        </PreviewCard>

        <PreviewCard
          icon={TimerIcon}
          accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          title="Lead Time Rata-rata"
          to="/lead-time"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">PR → Invoice</span>
              <span className="font-medium tabular-nums">
                {stats.avgPr > 0 ? `${formatNumber(Math.round(stats.avgPr * 10) / 10)} hari` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">PO → Invoice</span>
              <span className="font-medium tabular-nums">
                {stats.avgPo > 0 ? `${formatNumber(Math.round(stats.avgPo * 10) / 10)} hari` : "-"}
              </span>
            </div>
          </div>
        </PreviewCard>

        <PreviewCard
          icon={AlertTriangleIcon}
          accent="bg-red-500/10 text-red-600 dark:text-red-400"
          title="Kenaikan Harga"
          to="/price-alert"
        >
          {!stats.topAlert ? (
            <p className="text-muted-foreground">
              Tidak ada kenaikan harga berurutan ≥ 10%.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="font-medium">
                {formatNumber(stats.alerts.length)} item terdeteksi
              </p>
              <p className="text-muted-foreground">
                <span className="truncate">{stats.topAlert.item}</span> naik{" "}
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatPercent(stats.topAlert.increase * 100)}
                </span>
              </p>
            </div>
          )}
        </PreviewCard>

        <PreviewCard
          icon={TrendingUpIcon}
          accent="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
          title="Selisih Qty (Variance)"
          to="/variance"
        >
          {stats.varianceCount === 0 ? (
            <p className="text-muted-foreground">
              Semua transaksi sesuai qty pesanan.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="font-medium">
                {formatNumber(stats.varianceCount)} transaksi tidak sesuai
              </p>
              <p className="text-muted-foreground">
                Total selisih{" "}
                <span className="font-medium tabular-nums">
                  {formatNumber(stats.varianceDiff)} unit
                </span>
              </p>
            </div>
          )}
        </PreviewCard>
      </div>
    </PageLayout>
  );
}
