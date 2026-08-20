import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
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

const FAST_MOVING_MAX_DAYS = 30;

interface FastMovingProps {
  stock: ParsedStockRecord[];
}

interface FastMovingRow {
  itemCode: string;
  itemName: string;
  warehouse: string;
  uom: string;
  onHand: number;
  lastUsageDate: string;
  daysSinceLastUsage: number;
  lastPurchaseQuantity: number;
  value: number;
}

export default function FastMoving({ stock }: FastMovingProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const fastRows = useMemo(() => {
    return stock
      .filter(
        (s) => s.onHand > 0 && s.daysSinceLastUsage < FAST_MOVING_MAX_DAYS,
      )
      .map((s) => ({
        itemCode: s.itemCode,
        itemName: s.itemName,
        warehouse: warehouseFull(s.warehouseCode, s.warehouseName),
        uom: s.uom,
        onHand: s.onHand,
        lastUsageDate: s.lastUsageDate,
        daysSinceLastUsage: s.daysSinceLastUsage,
        lastPurchaseQuantity: s.lastPurchaseQuantity,
        value: s.onHand * s.lastPurchaseCost,
      }))
      .sort((a, b) => a.daysSinceLastUsage - b.daysSinceLastUsage);
  }, [stock]);

  const totalQty = useMemo(
    () => fastRows.reduce((sum, r) => sum + r.onHand, 0),
    [fastRows],
  );
  const totalValue = useMemo(
    () => fastRows.reduce((sum, r) => sum + r.value, 0),
    [fastRows],
  );
  const fastest = fastRows[0];

  const chartData = useMemo(
    () =>
      fastRows.slice(0, 10).map((r) => ({
        name:
          r.itemName.length > (isMobile ? 18 : 28)
            ? r.itemName.substring(0, isMobile ? 18 : 28) + "..."
            : r.itemName,
        total: round1(r.value),
      })),
    [fastRows, isMobile],
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
      render: (r: FastMovingRow) => formatNumber(r.onHand),
    },
    { key: "uom", label: "Satuan" },
    {
      key: "lastUsageDate",
      label: "Terakhir Dipakai",
      render: (r: FastMovingRow) => formatDate(r.lastUsageDate),
    },
    {
      key: "daysSinceLastUsage",
      label: "Hari Sejak Pemakaian",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "value",
      label: "Nilai",
      align: "right" as const,
      sortable: true,
      render: (r: FastMovingRow) => formatRupiah(r.value),
    },
  ];

  return (
    <PageLayout
      title="Fast Moving"
      subtitle={`Item dengan perputaran cepat: pemakaian terakhir < ${FAST_MOVING_MAX_DAYS} hari.`}
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Fast moving didefinisikan sebagai item dengan
        on-hand &gt; 0 dan pemakaian terakhir kurang dari {FAST_MOVING_MAX_DAYS}{" "}
        hari.
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Item Fast Moving"
          value={formatNumber(fastRows.length)}
        />
        <StatCard title="Total On-Hand" value={formatNumber(totalQty)} />
        <StatCard title="Total Nilai" value={formatRupiah(totalValue)} />
        <StatCard
          title="Paling Cepat Bergerak"
          value={fastest ? `${fastest.daysSinceLastUsage} hari` : "-"}
          subtitle={fastest?.itemName}
          accent
        />
      </div>

      <ChartCard
        title="Item Fast Moving Terbesar (10 Teratas)"
        description="Berdasarkan nilai on-hand × harga beli terakhir"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Nilai"
          tickFormatter={formatRupiahCompact}
          tooltipFormatter={formatRupiah}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={fastRows}
        searchable
        searchFields={["itemCode", "itemName", "warehouse"]}
        showExport
        showColumnToggle
        title="fast-moving"
        totalColumns={["onHand", "value"]}
      />
    </PageLayout>
  );
}