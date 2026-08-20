import { useMemo } from "react";
import type { ParsedPurchaseOrder } from "../types/purchase";
import type { DateRange } from "../types/ui";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
  formatPercent,
  formatDate,
  round1,
  warehouseLabel,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";

interface OutstandingPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface OutstandingPOGroup {
  orderNumber: string;
  orderDate: string;
  orderDateObj: Date | null;
  supplierName: string;
  targetWarehouse: string;
  prNumber: string;
  expectedDeliveryDate: string;
  itemCount: number;
  qtyOrdered: number;
  qtyDelivered: number;
  qtyOutstanding: number;
  pctDelivered: number;
  orderNetTotal: number;
}

export default function OutstandingPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: OutstandingPOProps) {
  const isMobile = useIsMobile();

  const outstandingGroups = useMemo(() => {
    const grouped: Record<string, ParsedPurchaseOrder[]> = {};
    poItems.forEach((po) => {
      if (
        po.qtyDelivered > 0 &&
        po.qtyDelivered < po.qtyOrdered &&
        po.qtyOrdered > 0
      ) {
        if (!grouped[po.orderNumber]) grouped[po.orderNumber] = [];
        grouped[po.orderNumber].push(po);
      }
    });

    return Object.values(grouped)
      .map((lines) => ({
        orderNumber: lines[0].orderNumber,
        orderDate: lines[0].orderDate,
        orderDateObj: lines[0].orderDateObj,
        supplierName: lines[0].supplierName || "-",
        targetWarehouse: warehouseLabel(lines[0].targetWarehouse),
        prNumber: lines[0].prNumber || "-",
        expectedDeliveryDate: lines[0].expectedDeliveryDate,
        itemCount: lines.length,
        qtyOrdered: round1(lines.reduce((sum, l) => sum + l.qtyOrdered, 0)),
        qtyDelivered: round1(lines.reduce((sum, l) => sum + l.qtyDelivered, 0)),
        qtyOutstanding: round1(
          lines.reduce((sum, l) => sum + (l.qtyOrdered - l.qtyDelivered), 0),
        ),
        pctDelivered: 0,
        orderNetTotal: lines[0].orderNetTotal,
      }))
      .map((g) => ({
        ...g,
        pctDelivered:
          g.qtyOrdered > 0 ? (g.qtyDelivered / g.qtyOrdered) * 100 : 0,
      }))
      .sort(
        (a, b) =>
          b.qtyOutstanding - a.qtyOutstanding ||
          a.orderNumber.localeCompare(b.orderNumber),
      );
  }, [poItems]);

  const totalOutstandingQty = useMemo(
    () =>
      outstandingGroups.reduce((sum, g) => sum + g.qtyOutstanding, 0),
    [outstandingGroups],
  );
  const totalOrderValue = useMemo(
    () => outstandingGroups.reduce((sum, g) => sum + g.orderNetTotal, 0),
    [outstandingGroups],
  );
  const totalItemLines = useMemo(
    () => outstandingGroups.reduce((sum, g) => sum + g.itemCount, 0),
    [outstandingGroups],
  );

  const chartData = useMemo(() => {
    const bySupplier: Record<string, number> = {};
    outstandingGroups.forEach((g) => {
      bySupplier[g.supplierName] = (bySupplier[g.supplierName] || 0) + g.orderNetTotal;
    });
    return Object.entries(bySupplier)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({
        name:
          name.length > (isMobile ? 13 : 20)
            ? name.substring(0, isMobile ? 13 : 20) + "..."
            : name,
        total,
      }));
  }, [outstandingGroups, isMobile]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      sortable: true,
      render: (g: OutstandingPOGroup) => formatDate(g.orderDate),
    },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "targetWarehouse", label: "Target Gudang" },
    { key: "itemCount", label: "Jumlah Item", align: "right" as const },
    {
      key: "qtyOutstanding",
      label: "Qty Belum Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: OutstandingPOGroup) => formatNumber(g.qtyOutstanding),
    },
    {
      key: "pctDelivered",
      label: "% Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: OutstandingPOGroup) => formatPercent(g.pctDelivered),
    },
    {
      key: "orderNetTotal",
      label: "Nilai PO",
      align: "right" as const,
      sortable: true,
      render: (g: OutstandingPOGroup) => formatRupiah(g.orderNetTotal),
    },
    {
      key: "expectedDeliveryDate",
      label: "Expected Delivery",
      render: (g: OutstandingPOGroup) => formatDate(g.expectedDeliveryDate),
    },
    { key: "prNumber", label: "Nomor PR" },
  ];

  return (
    <PageLayout
      title="Outstanding PO"
      subtitle="Laporan PO yang barangnya diterima sebagian dan masih memiliki sisa kuantitas belum diterima."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Status PO tidak tersimpan eksplisit di dataset — status "outstanding"
        disimpulkan dari kesesuaian qty diterima vs qty dipesan (0 &lt; qty
        diterima &lt; qty pesan). Filter tanggal berlaku pada tanggal PO.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah PO Outstanding"
          value={formatNumber(outstandingGroups.length)}
        />
        <StatCard
          title="Jumlah Baris Item"
          value={formatNumber(totalItemLines)}
        />
        <StatCard
          title="Total Nilai PO"
          value={formatRupiah(totalOrderValue)}
        />
        <StatCard
          title="Qty Belum Diterima"
          value={formatNumber(totalOutstandingQty)}
          accent
        />
      </div>

      <ChartCard
        title="Nilai PO per Supplier (10 Terbesar)"
        description="Supplier dengan nilai PO outstanding tertinggi"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Nilai PO"
          tickFormatter={formatRupiahCompact}
          tooltipFormatter={formatRupiah}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={outstandingGroups}
        searchable
        searchFields={["orderNumber", "supplierName", "targetWarehouse"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "orderNumber",
          "orderDate",
          "supplierName",
          "itemCount",
          "qtyOutstanding",
          "pctDelivered",
          "orderNetTotal",
        ]}
        title="outstanding-po"
        totalColumns={["qtyOutstanding", "orderNetTotal"]}
      />
    </PageLayout>
  );
}