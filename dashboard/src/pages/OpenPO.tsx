import { useMemo } from "react";
import type { ParsedPurchaseOrder } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
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

interface OpenPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function OpenPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: OpenPOProps) {
  const openPOs = useMemo(
    () =>
      poItems
        .filter((po) => po.purchaseInvoice === "")
        .sort(
          (a, b) =>
            ((a.orderDateObj?.getTime() ?? 0) -
              (b.orderDateObj?.getTime() ?? 0)) ||
            a.orderNumber.localeCompare(b.orderNumber),
        ),
    [poItems],
  );

  const poCount = useMemo(
    () => new Set(openPOs.map((po) => po.orderNumber)).size,
    [openPOs],
  );
  const totalOrderValue = useMemo(
    () => openPOs.reduce((sum, po) => sum + po.orderNetTotal, 0),
    [openPOs],
  );
  const supplierCount = useMemo(
    () => new Set(openPOs.map((po) => po.supplierName)).size,
    [openPOs],
  );
  const oldestPo = useMemo(
    () =>
      openPOs.reduce<{ number: string; date: Date | null } | null>(
        (oldest, po) => {
          if (
            po.orderDateObj &&
            (!oldest || po.orderDateObj < (oldest.date ?? Infinity))
          ) {
            return { number: po.orderNumber, date: po.orderDateObj };
          }
          return oldest;
        },
        null,
      ),
    [openPOs],
  );

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
      key: "qtyOutstanding",
      label: "Qty Outstanding",
      align: "right" as const,
      sortable: true,
      render: (po: ParsedPurchaseOrder) => formatNumber(po.qtyOutstanding),
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
    { key: "requestedBy", label: "Diminta oleh" },
  ];

  return (
    <PageLayout
      title="Open PO"
      subtitle="Laporan Purchase Order (PO) yang belum ter-invoice."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Sumber data PO tidak menyimpan status open/closed. Laporan ini
        menurunkan status dari ada-tidaknya nomor invoice pada baris PO: PO
        dianggap masih terbuka (open) selama belum memiliki invoice terkait.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah PO Terbuka"
          value={formatNumber(poCount)}
          subtitle={`${formatNumber(openPOs.length)} baris item`}
        />
        <StatCard
          title="Total Nilai PO"
          value={formatRupiah(totalOrderValue)}
          subtitle="Nilai pesanan belum ter-invoice"
        />
        <StatCard
          title="Jumlah Supplier"
          value={formatNumber(supplierCount)}
          subtitle="Supplier dengan PO terbuka"
        />
        <StatCard
          title="PO Tertua"
          value={oldestPo?.number || "-"}
          subtitle={oldestPo?.date ? formatDate(oldestPo.date.toISOString()) : ""}
          accent
        />
      </div>

      <DataTable
        columns={columns}
        data={openPOs}
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
          "orderNetTotal",
        ]}
        title="open-po"
        totalColumns={["qtyOrdered", "qtyOutstanding", "orderNetTotal"]}
      />
    </PageLayout>
  );
}