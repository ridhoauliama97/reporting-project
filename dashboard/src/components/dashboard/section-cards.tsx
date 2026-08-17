"use client";

import type { ParsedPurchaseItem } from "@/types/purchase";
import { formatRupiah, formatRupiahCompact, formatNumber } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

interface SectionCardsProps {
  items: ParsedPurchaseItem[];
  prevItems?: ParsedPurchaseItem[];
}

function pctChange(cur: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

function TrendBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <Badge variant="outline">
        <MinusIcon /> 0.0%
      </Badge>
    );
  }
  const up = value >= 0;
  return (
    <Badge
      variant="outline"
      className={
        up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
      }
    >
      {up ? <TrendingUpIcon /> : <TrendingDownIcon />}
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </Badge>
  );
}

export function SectionCards({ items, prevItems }: SectionCardsProps) {
  const total = items.reduce((s, i) => s + i.netTotal, 0);
  const count = items.length;
  const suppliers = new Set(items.map((i) => i.supplierName)).size;
  const avg = count > 0 ? total / count : 0;

  const prevTotal = prevItems?.reduce((s, i) => s + i.netTotal, 0) ?? 0;
  const prevCount = prevItems?.length ?? 0;
  const prevSuppliers = prevItems
    ? new Set(prevItems.map((i) => i.supplierName)).size
    : 0;

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs *:data-[slot=card]:transition-shadow *:data-[slot=card]:hover:shadow-md @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="min-w-0">Total Nilai Pembelian</CardDescription>
          <CardTitle
            className="min-w-0 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
            title={formatRupiah(total)}
          >
            {formatRupiahCompact(total)}
          </CardTitle>
          <CardAction className="min-w-0">
            <TrendBadge value={pctChange(total, prevTotal)} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dibandingkan periode sebelumnya{" "}
            <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total netto transaksi pada periode terpilih
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="min-w-0">Jumlah Transaksi</CardDescription>
          <CardTitle className="min-w-0 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(count)}
          </CardTitle>
          <CardAction className="min-w-0">
            <TrendBadge value={pctChange(count, prevCount)} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total baris item ter-invoice <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Pada periode terpilih</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="min-w-0">Supplier Aktif</CardDescription>
          <CardTitle className="min-w-0 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(suppliers)}
          </CardTitle>
          <CardAction className="min-w-0">
            <TrendBadge value={pctChange(suppliers, prevSuppliers)} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Supplier dengan transaksi <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Unik pada periode terpilih
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="min-w-0">Rata-rata Nilai per Transaksi</CardDescription>
          <CardTitle
            className="min-w-0 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl"
            title={formatRupiah(avg)}
          >
            {formatRupiahCompact(avg)}
          </CardTitle>
          <CardAction className="min-w-0">
            <TrendBadge
              value={
                avg > 0 && prevCount > 0
                  ? pctChange(avg, prevTotal / prevCount)
                  : null
              }
            />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total nilai dibagi transaksi <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Pada periode terpilih</div>
        </CardFooter>
      </Card>
    </div>
  );
}
