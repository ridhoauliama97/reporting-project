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

interface ClosedPOProps {
  poItems: ParsedPurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

interface ClosedPOGroup {
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

export default function ClosedPO({
  poItems,
  dateRange,
  onDateRangeChange,
}: ClosedPOProps) {
  const isMobile = useIsMobile();

  const closedGroups = useMemo(() => {
    const grouped: Record<string, ParsedPurchaseOrder[]> = {};
    poItems.forEach((po) => {
      if (!grouped[po.orderNumber]) grouped[po.orderNumber] = [];
      grouped[po.orderNumber].push(po);
    });

    return Object.values(grouped)
      .filter((lines) =>
        lines.every((l) => l.qtyDelivered >= l.qtyOrdered),
      )
      .map((lines) => {
        const qtyOrdered = round1(
          lines.reduce((sum, l) => sum + l.qtyOrdered, 0),
        );
        const qtyDelivered = round1(
          lines.reduce((sum, l) => sum + l.qtyDelivered, 0),
        );
        return {
          orderNumber: lines[0].orderNumber,
          orderDate: lines[0].orderDate,
          orderDateObj: lines[0].orderDateObj,
          supplierName: lines[0].supplierName || "-",
          targetWarehouse: warehouseLabel(lines[0].targetWarehouse),
          prNumber: lines[0].prNumber || "-",
          expectedDeliveryDate: lines[0].expectedDeliveryDate,
          itemCount: lines.length,
          qtyOrdered,
          qtyDelivered,
          qtyOutstanding: 0,
          pctDelivered:
            qtyOrdered > 0
              ? Math.min(100, (qtyDelivered / qtyOrdered) * 100)
              : 100,
          orderNetTotal: lines[0].orderNetTotal,
        };
      })
      .sort(
        (a, b) =>
          (a.orderDateObj?.getTime() ?? 0) -
            (b.orderDateObj?.getTime() ?? 0) ||
          a.orderNumber.localeCompare(b.orderNumber),
      );
  }, [poItems]);

  const totalItemLines = useMemo(
    () => closedGroups.reduce((sum, g) => sum + g.itemCount, 0),
    [closedGroups],
  );
  const totalOrderValue = useMemo(
    () => closedGroups.reduce((sum, g) => sum + g.orderNetTotal, 0),
    [closedGroups],
  );

  const chartData = useMemo(() => {
    const bySupplier: Record<string, number> = {};
    closedGroups.forEach((g) => {
      bySupplier[g.supplierName] =
        (bySupplier[g.supplierName] || 0) + g.orderNetTotal;
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
  }, [closedGroups, isMobile]);

  const columns = [
    { key: "orderNumber", label: "Nomor PO", sortable: true },
    {
      key: "orderDate",
      label: "Tanggal PO",
      sortable: true,
      render: (g: ClosedPOGroup) => formatDate(g.orderDate),
    },
    { key: "supplierName", label: "Supplier", sortable: true },
    { key: "targetWarehouse", label: "Target Gudang" },
    { key: "itemCount", label: "Jumlah Item", align: "right" as const },
    {
      key: "pctDelivered",
      label: "% Diterima",
      align: "right" as const,
      sortable: true,
      render: (g: ClosedPOGroup) => formatPercent(g.pctDelivered),
    },
    {
      key: "orderNetTotal",
      label: "Nilai PO",
      align: "right" as const,
      sortable: true,
      render: (g: ClosedPOGroup) => formatRupiah(g.orderNetTotal),
    },
    {
      key: "expectedDeliveryDate",
      label: "Expected Delivery",
      render: (g: ClosedPOGroup) => formatDate(g.expectedDeliveryDate),
    },
    { key: "prNumber", label: "Nomor PR" },
  ];

  return (
    <PageLayout
      title="Closed PO"
      subtitle="Laporan PO yang seluruh item-nya sudah diterima penuh."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <InfoBanner>
        Status "closed" tidak tersimpan eksplisit di dataset — disimpulkan
        dari kesesuaian qty diterima vs qty dipesan (seluruh baris item
        diterima penuh), bukan dari status sistem. Filter tanggal berlaku pada
        tanggal PO.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah PO Closed"
          value={formatNumber(closedGroups.length)}
        />
        <StatCard
          title="Jumlah Baris Item"
          value={formatNumber(totalItemLines)}
        />
        <StatCard title="Total Nilai PO" value={formatRupiah(totalOrderValue)} />
        <StatCard
          title="Qty Belum Diterima"
          value={formatNumber(0)}
          subtitle="Seluruh qty sudah diterima"
          accent
        />
      </div>

      <ChartCard
        title="Nilai PO per Supplier (10 Terbesar)"
        description="Supplier dengan nilai PO closed tertinggi"
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
        data={closedGroups}
        searchable
        searchFields={["orderNumber", "supplierName", "targetWarehouse"]}
        showExport
        showColumnToggle
        defaultVisible={[
          "orderNumber",
          "orderDate",
          "supplierName",
          "itemCount",
          "pctDelivered",
          "orderNetTotal",
        ]}
        title="closed-po"
        totalColumns={["orderNetTotal"]}
      />
    </PageLayout>
  );
}