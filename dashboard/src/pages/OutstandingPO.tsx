import { useMemo } from "react";
import type { ParsedPurchaseOrder } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatPercent,
  formatDate,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import InfoBanner from "../components/InfoBanner";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface OutstandingPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function OutstandingPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: OutstandingPOProps) {
  const outstanding = useMemo(
    () =>
      poItems
        .filter((po) => po.qtyOutstanding > 0)
        .sort(
          (a, b) =>
            b.qtyOutstanding - a.qtyOutstanding ||
            a.orderNumber.localeCompare(b.orderNumber),
        ),
    [poItems],
  );

  const totalOutstandingQty = useMemo(
    () =>
      outstanding.reduce(
        (sum, po) => sum + po.qtyOutstanding * Math.max(po.itemUnitCost, 0),
        0,
      ),
    [outstanding],
  );
  const poCount = useMemo(
    () => new Set(outstanding.map((po) => po.orderNumber)).size,
    [outstanding],
  );
  const topSupplier = useMemo(() => {
    const counts: Record<string, number> = {};
    outstanding.forEach((po) => {
      const name = po.supplierName || "-";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  }, [outstanding]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatDate(po.orderDate),
    },
    {
      key: "expectedDeliveryDate",
      label: "Target Kirim",
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatDate(po.expectedDeliveryDate),
    },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "itemName", label: "Item", sortable: true },
    { key: "itemCategory", label: "Kategori", sortable: true },
    { key: "uom", label: "Satuan" },
    {
      key: "qtyOrdered",
      label: "Qty Dipesan",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatNumber(po.qtyOrdered),
    },
    {
      key: "qtyDelivered",
      label: "Qty Diterima",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatNumber(po.qtyDelivered),
    },
    {
      key: "qtyOutstanding",
      label: "Qty Outstanding",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatNumber(po.qtyOutstanding),
    },
    {
      key: "pctDelivered",
      label: "% Diterima",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatPercent(po.pctDelivered * 100),
    },
    {
      key: "itemUnitCost",
      label: "Harga Satuan",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatRupiah(po.itemUnitCost),
    },
    {
      key: "orderNetTotal",
      label: "Nilai PO",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatRupiah(po.orderNetTotal),
    },
    { key: "prNumber", label: "Nomor PR" },
    { key: "targetWarehouse", label: "Gudang Tujuan" },
  ];

  return (
    <PageLayout
      title="Outstanding PO"
      subtitle="Laporan PO yang masih memiliki sisa kuantitas belum diterima."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Sumber data PO tidak menyimpan status open/closed, sehingga laporan ini
        menurunkan status dari sisa kuantitas belum diterima (qty outstanding).
        PO dianggap selesai saat seluruh kuantitas sudah diterima.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah PO Outstanding"
          value={formatNumber(poCount)}
          subtitle={`${formatNumber(outstanding.length)} baris item`}
        />
        <StatCard
          title="Total Qty Outstanding"
          value={formatNumber(
            outstanding.reduce((sum, po) => sum + po.qtyOutstanding, 0),
          )}
          subtitle="Seluruh sisa qty belum diterima"
        />
        <StatCard
          title="Nilai Outstanding"
          value={formatRupiah(totalOutstandingQty)}
          subtitle="Qty sisa × harga satuan PO"
        />
        <StatCard
          title="Supplier Terbanyak"
          value={topSupplier?.[0] || "-"}
          subtitle={
            topSupplier ? `${formatNumber(topSupplier[1])} baris PO` : ""
          }
          accent
        />
      </div>

      <DataTable
        columns={columns}
        data={outstanding}
        searchable
        searchFields={["orderNumber", "supplierName", "itemName"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "orderNumber",
          "orderDate",
          "supplierName",
          "itemName",
          "qtyOrdered",
          "qtyOutstanding",
          "pctDelivered",
          "orderNetTotal",
        ]}
        title="outstanding-po"
        totalColumns={["qtyOrdered", "qtyOutstanding", "orderNetTotal"]}
      />
    </PageLayout>
  );
}