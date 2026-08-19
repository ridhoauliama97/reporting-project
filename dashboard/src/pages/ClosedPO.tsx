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

interface ClosedPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function ClosedPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: ClosedPOProps) {
  const closedPOs = useMemo(
    () =>
      poItems
        .filter((po) => po.purchaseInvoice !== "")
        .sort((a, b) => a.orderNumber.localeCompare(b.orderNumber)),
    [poItems],
  );

  const poCount = useMemo(
    () => new Set(closedPOs.map((po) => po.orderNumber)).size,
    [closedPOs],
  );
  const totalOrderValue = useMemo(
    () => closedPOs.reduce((sum, po) => sum + po.orderNetTotal, 0),
    [closedPOs],
  );
  const supplierCount = useMemo(
    () => new Set(closedPOs.map((po) => po.supplierName)).size,
    [closedPOs],
  );
  const avgPoPiDays = useMemo(() => {
    const valid = closedPOs.filter((po) => po.poPiDays > 0);
    return valid.length > 0
      ? valid.reduce((sum, po) => sum + po.poPiDays, 0) / valid.length
      : 0;
  }, [closedPOs]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    { key: "purchaseInvoice", label: "Nomor Invoice", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatDate(po.orderDate),
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
    {
      key: "poPiDays",
      label: "Hari PO→Invoice",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) =>
        po.poPiDays > 0 ? po.poPiDays.toFixed(1) : "-",
    },
    { key: "prNumber", label: "Nomor PR" },
    { key: "targetWarehouse", label: "Gudang Tujuan" },
  ];

  return (
    <PageLayout
      title="Closed PO"
      subtitle="Laporan Purchase Order (PO) yang sudah ter-invoice."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Sumber data PO tidak menyimpan status open/closed. Laporan ini
        menurunkan status dari ada-tidaknya nomor invoice pada baris PO: PO
        dianggap tertutup (closed) saat sudah memiliki invoice terkait.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah PO Ter-invoice"
          value={formatNumber(poCount)}
          subtitle={`${formatNumber(closedPOs.length)} baris item`}
        />
        <StatCard
          title="Total Nilai PO"
          value={formatRupiah(totalOrderValue)}
          subtitle="Nilai pesanan sudah ter-invoice"
        />
        <StatCard
          title="Jumlah Supplier"
          value={formatNumber(supplierCount)}
          subtitle="Supplier dengan PO tertutup"
        />
        <StatCard
          title="Rata-rata PO→Invoice"
          value={avgPoPiDays > 0 ? avgPoPiDays.toFixed(1) : "-"}
          subtitle="Hari dari PO ke invoice"
          accent
        />
      </div>

      <DataTable
        columns={columns}
        data={closedPOs}
        searchable
        searchFields={["orderNumber", "purchaseInvoice", "supplierName", "itemName"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "orderNumber",
          "purchaseInvoice",
          "orderDate",
          "supplierName",
          "itemName",
          "qtyOrdered",
          "orderNetTotal",
          "poPiDays",
        ]}
        title="closed-po"
        totalColumns={["qtyOrdered", "orderNetTotal"]}
      />
    </PageLayout>
  );
}