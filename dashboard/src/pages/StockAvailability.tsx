import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatDate,
  warehouseFull,
  round1,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";

interface StockAvailabilityProps {
  stock: ParsedStockRecord[];
}

interface AvailabilityRow {
  itemCode: string;
  itemName: string;
  warehouse: string;
  uom: string;
  onHand: number;
  qtyBlocked: number;
  qtyInTransit: number;
  outstandingPO: number;
  outstandingSO: number;
  available: number;
  qtyMinimumOrder: number;
  shortage: number;
}

export default function StockAvailability({ stock }: StockAvailabilityProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const availabilityRows = useMemo(() => {
    return stock
      .map((s) => {
        const available = s.onHand - s.qtyBlocked;
        const shortage =
          s.qtyMinimumOrder > 0
            ? Math.max(0, s.qtyMinimumOrder - available)
            : 0;
        return {
          itemCode: s.itemCode,
          itemName: s.itemName,
          warehouse: warehouseFull(s.warehouseCode, s.warehouseName),
          uom: s.uom,
          onHand: s.onHand,
          qtyBlocked: s.qtyBlocked,
          qtyInTransit: s.qtyInTransit,
          outstandingPO: s.outstandingPO,
          outstandingSO: s.outstandingSO,
          available: round1(available),
          qtyMinimumOrder: s.qtyMinimumOrder,
          shortage: round1(shortage),
        };
      })
      .sort((a, b) => b.shortage - a.shortage);
  }, [stock]);

  const shortItems = useMemo(
    () => availabilityRows.filter((r) => r.shortage > 0),
    [availabilityRows],
  );
  const totalShortage = useMemo(
    () => shortItems.reduce((sum, r) => sum + r.shortage, 0),
    [shortItems],
  );
  const totalOnHand = useMemo(
    () => availabilityRows.reduce((sum, r) => sum + r.onHand, 0),
    [availabilityRows],
  );
  const withOpenPO = useMemo(
    () => availabilityRows.filter((r) => r.outstandingPO > 0).length,
    [availabilityRows],
  );

  const chartData = useMemo(
    () =>
      shortItems.slice(0, 10).map((r) => ({
        name:
          r.itemName.length > (isMobile ? 18 : 28)
            ? r.itemName.substring(0, isMobile ? 18 : 28) + "..."
            : r.itemName,
        total: r.shortage,
      })),
    [shortItems, isMobile],
  );

  const columns = [
    { key: "itemCode", label: "Kode Item" },
    { key: "itemName", label: "Nama Item", sortable: true },
    { key: "warehouse", label: "Gudang", sortable: true },
    {
      key: "onHand",
      label: "On-Hand",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.onHand),
    },
    {
      key: "qtyBlocked",
      label: "Diblokir",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.qtyBlocked),
    },
    {
      key: "qtyInTransit",
      label: "Dalam Transit",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.qtyInTransit),
    },
    {
      key: "outstandingPO",
      label: "Outstanding PO",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.outstandingPO),
    },
    {
      key: "outstandingSO",
      label: "Outstanding SO",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.outstandingSO),
    },
    {
      key: "available",
      label: "Tersedia",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.available),
    },
    {
      key: "qtyMinimumOrder",
      label: "Min. Order",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) => formatNumber(r.qtyMinimumOrder),
    },
    {
      key: "shortage",
      label: "Kekurangan",
      align: "right" as const,
      sortable: true,
      render: (r: AvailabilityRow) =>
        r.shortage > 0 ? (
          <span className="font-semibold text-red-600 dark:text-red-400">
            {formatNumber(r.shortage)}
          </span>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <PageLayout
      title="Stock Availability"
      subtitle="Ketersediaan stok: on-hand setelah dikurangi blokir, dibandingkan dengan minimum order."
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Tersedia = on-hand − diblokir; kekurangan
        muncul saat tersedia &lt; minimum order.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Item"
          value={formatNumber(availabilityRows.length)}
        />
        <StatCard
          title="Item Kurang Stok"
          value={formatNumber(shortItems.length)}
          subtitle="Di bawah minimum order"
        />
        <StatCard title="Total On-Hand" value={formatNumber(totalOnHand)} />
        <StatCard
          title="Total Kekurangan"
          value={formatNumber(totalShortage)}
          subtitle={`${formatNumber(withOpenPO)} item punya outstanding PO`}
          accent
        />
      </div>

      <ChartCard
        title="Item dengan Kekurangan Terbesar (10 Teratas)"
        description="Selisih minimum order terhadap stok tersedia"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Kekurangan"
          tooltipFormatter={formatNumber}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={availabilityRows}
        searchable
        searchFields={["itemCode", "itemName", "warehouse"]}
        showExport
        showColumnToggle
        title="stock-availability"
      />
    </PageLayout>
  );
}