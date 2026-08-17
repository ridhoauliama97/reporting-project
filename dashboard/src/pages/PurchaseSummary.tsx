import { useMemo } from "react";
import type { ParsedPurchaseItem } from "../types/purchase";
import { ITEM_CATEGORIES, CATEGORY_LABELS } from "../types/purchase";
import { formatRupiah, formatNumber, formatDate } from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PurchaseSummaryProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const COLUMN_GROUPS = [
  {
    name: "Transaksi",
    columns: [
      "purchaseNumber",
      "purchaseType",
      "purchaseDate",
      "dueDate",
      "poNumber",
      "poDate",
      "referenceNumber",
      "transitStatus",
    ],
  },
  {
    name: "Supplier",
    columns: ["supplierCode", "supplierName"],
  },
  {
    name: "Item",
    columns: ["itemCode", "itemName", "itemCategory", "itemType", "uom"],
  },
  {
    name: "Gudang",
    columns: ["warehouse"],
  },
  {
    name: "Kuantitas & Nilai",
    columns: ["quantity", "unitCost", "netTotal"],
  },
  {
    name: "PIC",
    columns: ["requestedBy", "usedBy", "poCreator", "poApprovedBy"],
  },
];

const DEFAULT_VISIBLE = [
  "purchaseNumber",
  "purchaseDate",
  "supplierName",
  "itemName",
  "itemCategory",
  "quantity",
  "unitCost",
  "uom",
  "netTotal",
];

export default function PurchaseSummary({
  items,
  dateRange,
  onDateRangeChange,
}: PurchaseSummaryProps) {
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    ITEM_CATEGORIES.forEach((cat) => {
      stats[cat] = { total: 0, count: 0 };
    });

    items.forEach((item) => {
      const cat = item.itemCategory as string;
      if (stats[cat]) {
        stats[cat].total += item.netTotal;
        stats[cat].count += 1;
      }
    });

    return stats;
  }, [items]);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.netTotal, 0),
    [items],
  );

  const columns = [
    { key: "purchaseNumber", label: "Nomor Purchase", sortable: true },
    { key: "purchaseType", label: "Tipe Purchase" },
    {
      key: "purchaseDate",
      label: "Tanggal Purchase",
      sortable: true,
      render: (item: ParsedPurchaseItem) => formatDate(item.purchaseDate),
    },
    {
      key: "dueDate",
      label: "Tanggal Jatuh Tempo",
      render: (item: ParsedPurchaseItem) => formatDate(item.dueDate),
    },
    { key: "poNumber", label: "Nomor PO", sortable: true },
    {
      key: "poDate",
      label: "Tanggal PO",
      render: (item: ParsedPurchaseItem) => formatDate(item.poDate),
    },
    { key: "referenceNumber", label: "Nomor Referensi" },
    { key: "transitStatus", label: "Status Transit" },
    { key: "supplierCode", label: "Kode Supplier" },
    { key: "supplierName", label: "Nama Supplier", sortable: true },
    { key: "itemCode", label: "Kode Item" },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "itemCategory", label: "Kategori Item", sortable: true },
    { key: "itemType", label: "Tipe Item" },
    { key: "uom", label: "Satuan" },
    { key: "warehouse", label: "Gudang" },
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
    { key: "requestedBy", label: "Diminta Oleh" },
    { key: "usedBy", label: "Digunakan Oleh" },
    { key: "poCreator", label: "Pembuat PO" },
    { key: "poApprovedBy", label: "PO Disetujui Oleh" },
  ];

  return (
    <PageLayout
      title="Purchase Summary"
      subtitle="Ringkasan nilai pembelian per kategori item dan detail transaksi."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {ITEM_CATEGORIES.map((cat) => (
          <StatCard
            key={cat}
            title={CATEGORY_LABELS[cat]}
            value={formatRupiah(categoryStats[cat].total)}
            subtitle={`${formatNumber(categoryStats[cat].count)} transaksi`}
          />
        ))}
        <StatCard
          title="Grand Total"
          value={formatRupiah(grandTotal)}
          subtitle={`${formatNumber(items.length)} transaksi`}
          accent
        />
      </div>
      <DataTable
        columns={columns}
        data={items}
        pageSize={25}
        searchable
        searchFields={['itemName', 'supplierName', 'purchaseNumber']}
        showExport
        showColumnToggle
        defaultVisible={DEFAULT_VISIBLE}
        columnGroups={COLUMN_GROUPS}
        title="ringkasan-pembelian"
        totalColumns={['quantity', 'unitCost', 'netTotal']}
      />
    </PageLayout>
  );
}
