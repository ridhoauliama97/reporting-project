import { useMemo, useState } from 'react';
import type { ParsedPurchaseItem } from '../types/purchase';
import { formatRupiah, formatNumber, formatDate } from '../utils/formatters';
import PageLayout from '../components/PageLayout';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import ChartCard from '../components/ChartCard';
import EmptyState from '../components/EmptyState';
import { TrendingUpIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PurchasePriceHistoryProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function PurchasePriceHistory({ items, dateRange, onDateRangeChange }: PurchasePriceHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<string>('');

  const uniqueItems = useMemo(() => {
    const itemMap = new Map<string, string>();
    items.forEach((item) => {
      if (!itemMap.has(item.itemName)) {
        itemMap.set(item.itemName, item.itemCode);
      }
    });
    return Array.from(itemMap.entries())
      .map(([name, code]) => ({ name, code }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filteredByItem = useMemo(() => {
    if (!selectedItem) return [];
    return items
      .filter((item) => item.itemName === selectedItem)
      .sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
  }, [items, selectedItem]);

  const priceStats = useMemo(() => {
    if (filteredByItem.length === 0) {
      return { last: 0, min: 0, max: 0, avg: 0 };
    }
    const prices = filteredByItem.map((i) => i.unitCost).filter((p) => p > 0);
    return {
      last: prices[prices.length - 1] || 0,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [filteredByItem]);

  const chartData = useMemo(() => {
    return filteredByItem.map((item) => ({
      date: formatDate(item.purchaseDate),
      harga: item.unitCost,
    }));
  }, [filteredByItem]);

  const columns = [
    { key: 'purchaseDate', label: 'Tanggal Purchase', sortable: true, render: (item: ParsedPurchaseItem) => formatDate(item.purchaseDate) },
    { key: 'purchaseNumber', label: 'Nomor Purchase', sortable: true },
    { key: 'supplierName', label: 'Nama Supplier', sortable: true },
    { key: 'quantity', label: 'Kuantitas', align: 'right' as const, render: (item: ParsedPurchaseItem) => formatNumber(item.quantity) },
    { key: 'unitCost', label: 'Harga Satuan', align: 'right' as const, sortable: true, render: (item: ParsedPurchaseItem) => formatRupiah(item.unitCost) },
    { key: 'netTotal', label: 'Total Netto', align: 'right' as const, sortable: true, render: (item: ParsedPurchaseItem) => formatRupiah(item.netTotal) },
  ];

  return (
    <PageLayout title="Riwayat Harga Pembelian" dateRange={dateRange} onDateRangeChange={onDateRangeChange}>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-muted-foreground">Pilih Item</label>
          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="-- Pilih Item --" />
            </SelectTrigger>
            <SelectContent>
              {uniqueItems.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedItem ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Harga Terakhir" value={formatRupiah(priceStats.last)} />
            <StatCard title="Harga Terendah" value={formatRupiah(priceStats.min)} />
            <StatCard title="Harga Tertinggi" value={formatRupiah(priceStats.max)} />
            <StatCard title="Rata-rata Harga" value={formatRupiah(priceStats.avg)} accent />
          </div>

          <ChartCard
            title="Grafik Harga"
            description="Riwayat harga per transaksi untuk item terpilih"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} dy={8} />
                <YAxis tickFormatter={(v) => `Rp ${(v / 1000).toFixed(0)}rb`} className="text-xs text-muted-foreground" tickLine={false} axisLine={false} width={56} />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} contentStyle={{ borderRadius: 8 }} />
                <Line type="monotone" dataKey="harga" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <DataTable columns={columns} data={filteredByItem} />
        </>
      ) : (
        <EmptyState
          icon={TrendingUpIcon}
          title="Riwayat Harga"
          description="Pilih item untuk melihat riwayat harga."
        />
      )}
    </PageLayout>
  );
}