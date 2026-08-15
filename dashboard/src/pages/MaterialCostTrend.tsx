import { useMemo, useState } from 'react';
import type { ParsedPurchaseItem } from '../types/purchase';
import { formatRupiah, formatPercent, getMonthYear, getMonthLabel } from '../utils/formatters';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import ChartCard from '../components/ChartCard';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface MaterialCostTrendProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function MaterialCostTrend({ items, dateRange, onDateRangeChange }: MaterialCostTrendProps) {
  const [showBahanBaku, setShowBahanBaku] = useState(true);
  const [showBahanPendukung, setShowBahanPendukung] = useState(true);

  const materialItems = useMemo(() => {
    return items.filter(
      (item) => item.itemCategory === 'BAHAN BAKU' || item.itemCategory === 'BAHAN PENDUKUNG'
    );
  }, [items]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { bahanBaku: number; bahanPendukung: number; total: number }> = {};

    materialItems.forEach((item) => {
      const monthKey = getMonthYear(item.purchaseDate);
      if (!monthKey) return;
      if (!grouped[monthKey]) {
        grouped[monthKey] = { bahanBaku: 0, bahanPendukung: 0, total: 0 };
      }
      if (item.itemCategory === 'BAHAN BAKU') {
        grouped[monthKey].bahanBaku += item.netTotal;
      } else {
        grouped[monthKey].bahanPendukung += item.netTotal;
      }
      grouped[monthKey].total += item.netTotal;
    });

    return Object.entries(grouped)
      .map(([key, data]) => ({
        month: key,
        label: getMonthLabel(key),
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [materialItems]);

  const totalCost = useMemo(() => materialItems.reduce((sum, i) => sum + i.netTotal, 0), [materialItems]);
  const avgPerMonth = monthlyData.length > 0 ? totalCost / monthlyData.length : 0;
  const highestMonth = monthlyData.reduce((max, m) => (m.total > max.total ? m : max), monthlyData[0]);

  const prevMonth = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2] : null;
  const currentMonth = monthlyData.length >= 1 ? monthlyData[monthlyData.length - 1] : null;
  const trendPercent = prevMonth && currentMonth && prevMonth.total > 0
    ? ((currentMonth.total - prevMonth.total) / prevMonth.total) * 100
    : 0;

  const chartData = monthlyData.map((m) => ({
    name: m.label,
    'Bahan Baku': m.bahanBaku,
    'Bahan Pendukung': m.bahanPendukung,
  }));

  const tableData = monthlyData.map((m) => ({
    month: m.label,
    bahanBaku: m.bahanBaku,
    bahanPendukung: m.bahanPendukung,
    total: m.total,
  }));

  const columns = [
    { key: 'month', label: 'Bulan', sortable: true },
    { key: 'bahanBaku', label: 'Bahan Baku', align: 'right' as const, render: (item: any) => formatRupiah(item.bahanBaku) },
    { key: 'bahanPendukung', label: 'Bahan Pendukung', align: 'right' as const, render: (item: any) => formatRupiah(item.bahanPendukung) },
    { key: 'total', label: 'Total', align: 'right' as const, render: (item: any) => formatRupiah(item.total) },
  ];

  return (
    <PageLayout title="Tren Biaya Material" dateRange={dateRange} onDateRangeChange={onDateRangeChange}>
      <Card>
        <CardContent className="p-4">
          <label className="mb-3 block text-sm font-medium text-muted-foreground">Filter Kategori</label>
          <div className="flex items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={showBahanBaku}
                onCheckedChange={(checked) => setShowBahanBaku(!!checked)}
              />
              <span>Bahan Baku</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={showBahanPendukung}
                onCheckedChange={(checked) => setShowBahanPendukung(!!checked)}
              />
              <span>Bahan Pendukung</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Biaya Material" value={formatRupiah(totalCost)} />
        <StatCard title="Rata-rata Biaya per Bulan" value={formatRupiah(avgPerMonth)} />
        <StatCard
          title="Bulan dengan Biaya Tertinggi"
          value={highestMonth?.label || '-'}
          subtitle={highestMonth ? formatRupiah(highestMonth.total) : ''}
          accent
        />
        <StatCard title="Trend vs Bulan Lalu" value={formatPercent(trendPercent)} />
      </div>

      <ChartCard
        title="Grafik Tren Biaya per Bulan"
        description="Total netto Bahan Baku dan Bahan Pendukung per bulan"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} dy={8} />
            <YAxis tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}jt`} className="text-xs text-muted-foreground" tickLine={false} axisLine={false} width={56} />
            <Tooltip formatter={(value) => formatRupiah(Number(value))} contentStyle={{ borderRadius: 8 }} />
            <Legend />
            {showBahanBaku && <Line type="monotone" dataKey="Bahan Baku" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />}
            {showBahanPendukung && <Line type="monotone" dataKey="Bahan Pendukung" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable columns={columns} data={tableData} />
    </PageLayout>
  );
}