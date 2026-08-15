import { useMemo } from 'react';
import type { ParsedPurchaseItem } from '../types/purchase';
import { formatDate } from '../utils/formatters';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PurchaseLeadTimeProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function PurchaseLeadTime({ items, dateRange, onDateRangeChange }: PurchaseLeadTimeProps) {
  const leadTimeData = useMemo(() => {
    return items.filter((i) => i.prPiDays > 0 || i.poPiDays > 0);
  }, [items]);

  const avgPrPiDays = useMemo(() => {
    const valid = items.filter((i) => i.prPiDays > 0);
    return valid.length > 0 ? valid.reduce((sum, i) => sum + i.prPiDays, 0) / valid.length : 0;
  }, [items]);

  const avgPoPiDays = useMemo(() => {
    const valid = items.filter((i) => i.poPiDays > 0);
    return valid.length > 0 ? valid.reduce((sum, i) => sum + i.poPiDays, 0) / valid.length : 0;
  }, [items]);

  const fastest = useMemo(() => {
    const valid = items.filter((i) => i.poPiDays > 0);
    return valid.length > 0 ? valid.reduce((min, i) => (i.poPiDays < min.poPiDays ? i : min)) : null;
  }, [items]);

  const slowest = useMemo(() => {
    const valid = items.filter((i) => i.poPiDays > 0);
    return valid.length > 0 ? valid.reduce((max, i) => (i.poPiDays > max.poPiDays ? i : max)) : null;
  }, [items]);

  const histogramData = useMemo(() => {
    const buckets = [
      { range: '0-3 hari', min: 0, max: 3, count: 0 },
      { range: '4-7 hari', min: 4, max: 7, count: 0 },
      { range: '8-14 hari', min: 8, max: 14, count: 0 },
      { range: '15+ hari', min: 15, max: Infinity, count: 0 },
    ];

    items.forEach((item) => {
      if (item.poPiDays > 0) {
        const bucket = buckets.find((b) => item.poPiDays >= b.min && item.poPiDays <= b.max);
        if (bucket) bucket.count += 1;
      }
    });

    return buckets;
  }, [items]);

  const columns = [
    { key: 'prNumber', label: 'Nomor PR', sortable: true },
    { key: 'prDate', label: 'Tanggal PR', render: (item: ParsedPurchaseItem) => formatDate(item.prDate) },
    { key: 'poNumber', label: 'Nomor PO', sortable: true },
    { key: 'poDate', label: 'Tanggal PO', render: (item: ParsedPurchaseItem) => formatDate(item.poDate) },
    { key: 'purchaseNumber', label: 'Nomor Purchase', sortable: true },
    { key: 'purchaseDate', label: 'Tanggal Purchase', render: (item: ParsedPurchaseItem) => formatDate(item.purchaseDate) },
    { key: 'prPiDays', label: 'Lead Time PR→Invoice (hari)', align: 'right' as const, sortable: true, render: (item: ParsedPurchaseItem) => item.prPiDays > 0 ? item.prPiDays : '-' },
    { key: 'poPiDays', label: 'Lead Time PO→Invoice (hari)', align: 'right' as const, sortable: true, render: (item: ParsedPurchaseItem) => item.poPiDays > 0 ? item.poPiDays : '-' },
  ];

  return (
    <PageLayout title="Lead Time Pembelian" dateRange={dateRange} onDateRangeChange={onDateRangeChange}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rata-rata Lead Time PR→Invoice" value={`${avgPrPiDays.toFixed(1)} hari`} />
        <StatCard title="Rata-rata Lead Time PO→Invoice" value={`${avgPoPiDays.toFixed(1)} hari`} />
        <StatCard
          title="Lead Time Tercepat"
          value={fastest ? `${fastest.poPiDays} hari` : '-'}
          subtitle={fastest?.purchaseNumber}
        />
        <StatCard
          title="Lead Time Terlama"
          value={slowest ? `${slowest.poPiDays} hari` : '-'}
          subtitle={slowest?.purchaseNumber}
          accent
        />
      </div>

      <ChartCard
        title="Distribusi Lead Time PO → Invoice"
        description="Histogram jumlah transaksi per rentang hari"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="range" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} dy={8} />
            <YAxis className="text-xs text-muted-foreground" tickLine={false} axisLine={false} width={40} />
            <Tooltip contentStyle={{ borderRadius: 8 }} />
            <Bar dataKey="count" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Jumlah Transaksi" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable columns={columns} data={leadTimeData} />
    </PageLayout>
  );
}