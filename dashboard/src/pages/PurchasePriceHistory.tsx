import { useMemo, useState } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { formatRupiah, formatRupiahCompact, formatNumber, formatDate, byPurchaseDateAsc } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import { TrendingUpIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const MAX_VISIBLE_ITEMS = 200;

interface PurchasePriceHistoryProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function PurchasePriceHistory({
  items,
  dateRange,
  onDateRangeChange,
}: PurchasePriceHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState("");

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

  const comboboxItems = comboboxSearch
    ? uniqueItems
    : uniqueItems.slice(0, MAX_VISIBLE_ITEMS);

  const filteredByItem = useMemo(() => {
    if (!selectedItem) return [];
    return items
      .filter((item) => item.itemName === selectedItem)
      .sort(byPurchaseDateAsc);
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
    {
      key: "purchaseDate",
      label: "Tanggal Purchase",
      sortable: true,
      render: (item: ParsedPurchaseItem) => formatDate(item.purchaseDate),
    },
    { key: "purchaseNumber", label: "Nomor Purchase", sortable: true },
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    {
      key: "quantity",
      label: "Kuantitas",
      align: "right" as const,
      render: (item: ParsedPurchaseItem) => formatNumber(item.quantity),
    },
    {
      key: "unitCost",
      label: "Harga Satuan",
      align: "right" as const,
      sortable: true,
      render: (item: ParsedPurchaseItem) => formatRupiah(item.unitCost),
    },
    {
      key: "netTotal",
      label: "Total Pembelian",
      align: "right" as const,
      sortable: true,
      render: (item: ParsedPurchaseItem) => formatRupiah(item.netTotal),
    },
  ];

  return (
    <PageLayout
      title="Purchase Price History"
      subtitle="Riwayat harga pembelian untuk setiap item"
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-muted-foreground">
            Pilih Item
          </label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-expanded={comboboxOpen}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:w-96"
              >
                {selectedItem || (
                  <span className="text-muted-foreground">-- Pilih Item --</span>
                )}
                <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-72 p-0 md:w-96">
              <Command>
                <CommandInput
                  placeholder="Cari item..."
                  value={comboboxSearch}
                  onValueChange={setComboboxSearch}
                />
                <CommandList>
                  <CommandEmpty>Tidak ada item ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {comboboxItems.map((item) => (
                      
                        <CommandItem
                          key={item.name}
                          value={item.name}
                          onSelect={(currentValue) => {
                            setSelectedItem(currentValue);
                            setComboboxOpen(false);
                            setComboboxSearch("");
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              "mr-2 size-4",
                              selectedItem === item.name
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span>{item.name}</span>
                        </CommandItem>
                    ))}
                  </CommandGroup>
                  {!comboboxSearch &&
                    uniqueItems.length > MAX_VISIBLE_ITEMS && (
                      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                        {uniqueItems.length - MAX_VISIBLE_ITEMS} item lainnya —
                        ketik untuk mencari
                      </p>
                    )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {selectedItem ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Harga Terakhir"
              value={formatRupiah(priceStats.last)}
            />
            <StatCard
              title="Harga Terendah"
              value={formatRupiah(priceStats.min)}
            />
            <StatCard
              title="Harga Tertinggi"
              value={formatRupiah(priceStats.max)}
            />
            <StatCard
              title="Rata-rata Harga"
              value={formatRupiah(priceStats.avg)}
              accent
            />
          </div>

          <ChartCard
            title="Grafik Harga"
            description="Riwayat harga per transaksi untuk item terpilih"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={50}
                  tickMargin={6}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  tickFormatter={(v) => formatRupiahCompact(Number(v))}
                  className="text-xs text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value))}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="harga"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
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

