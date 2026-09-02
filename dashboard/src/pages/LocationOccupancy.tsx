import { useMemo } from "react";
import type { ParsedStockRecord } from "../types/purchase";
import {
  formatNumber,
  formatRupiah,
  formatDate,
  warehouseFull,
} from "../utils/formatters";
import PageLayout from "../components/PageLayout";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import ChartCard from "../components/ChartCard";
import InfoBanner from "../components/InfoBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import TopBarChart from "../components/TopBarChart";

interface LocationOccupancyProps {
  stock: ParsedStockRecord[];
}

interface LocationRow {
  warehouse: string;
  location: string;
  itemCount: number;
  totalQty: number;
  totalValue: number;
}

export default function LocationOccupancy({ stock }: LocationOccupancyProps) {
  const isMobile = useIsMobile();

  const snapshotDate = stock.length ? formatDate(stock[0].date) : "-";

  const locationRows = useMemo(() => {
    const grouped: Record<string, LocationRow> = {};
    stock.forEach((s) => {
      const wh = warehouseFull(s.warehouseCode, s.warehouseName);
      const loc = s.shelfCode?.trim() || "Tanpa Lokasi";
      const key = `${wh}|${loc}`;
      if (!grouped[key]) {
        grouped[key] = {
          warehouse: wh,
          location: loc,
          itemCount: 0,
          totalQty: 0,
          totalValue: 0,
        };
      }
      grouped[key].itemCount += 1;
      grouped[key].totalQty += s.onHand;
      grouped[key].totalValue += s.onHand * s.lastPurchaseCost;
    });
    return Object.values(grouped).sort(
      (a, b) => b.itemCount - a.itemCount || b.totalValue - a.totalValue,
    );
  }, [stock]);

  const totalLocations = useMemo(
    () => locationRows.filter((r) => r.location !== "Tanpa Lokasi").length,
    [locationRows],
  );
  const withLocation = useMemo(
    () =>
      stock.filter((s) => s.shelfCode && s.shelfCode.trim() !== "").length,
    [stock],
  );
  const withoutLocation = stock.length - withLocation;
  const topLocation = locationRows[0];

  const chartData = useMemo(
    () =>
      locationRows.slice(0, 10).map((r) => ({
        name:
          r.location.length > (isMobile ? 14 : 22)
            ? r.location.substring(0, isMobile ? 14 : 22) + "..."
            : r.location,
        total: r.itemCount,
      })),
    [locationRows, isMobile],
  );

  const columns = [
    { key: "warehouse", label: "Gudang", sortable: true },
    { key: "location", label: "Lokasi", sortable: true },
    {
      key: "itemCount",
      label: "Jumlah Item",
      align: "right" as const,
      sortable: true,
    },
    {
      key: "totalQty",
      label: "Total On-Hand",
      align: "right" as const,
      sortable: true,
      render: (r: LocationRow) => formatNumber(r.totalQty),
    },
    {
      key: "totalValue",
      label: "Nilai",
      align: "right" as const,
      sortable: true,
      render: (r: LocationRow) => formatRupiah(r.totalValue),
    },
  ];

  return (
    <PageLayout
      title="Location Occupancy"
      subtitle="Pengisian lokasi/rak penyimpanan per gudang."
    >
      <InfoBanner>
        Data stok merupakan snapshot per {snapshotDate}. Hanya {formatNumber(withLocation)} dari{" "}
        {formatNumber(stock.length)} baris stok yang memiliki kode lokasi
        (shelf code); sisanya dikelompokkan sebagai "Tanpa Lokasi".
      </InfoBanner>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Jumlah Lokasi"
          value={formatNumber(totalLocations)}
        />
        <StatCard
          title="Item dengan Lokasi"
          value={formatNumber(withLocation)}
        />
        <StatCard
          title="Item Tanpa Lokasi"
          value={formatNumber(withoutLocation)}
        />
        <StatCard
          title="Lokasi Terpadat"
          value={formatNumber(topLocation?.itemCount ?? 0)}
          subtitle={topLocation?.location}
          accent
        />
      </div>

      <ChartCard
        title="Lokasi Terpadat (10 Teratas)"
        description="Berdasarkan jumlah item per lokasi"
      >
        <TopBarChart
          data={chartData}
          tooltipLabel="Item"
          tooltipFormatter={formatNumber}
          yWidthMobile={100}
          yWidthDesktop={150}
        />
      </ChartCard>

      <DataTable
        columns={columns}
        data={locationRows}
        searchable
        searchFields={["warehouse", "location"]}
        showExport
        showColumnToggle
        title="location-occupancy"
        totalColumns={["itemCount", "totalQty", "totalValue"]}
      />
    </PageLayout>
  );
}