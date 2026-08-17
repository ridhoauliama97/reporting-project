import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboardIcon,
  Building2Icon,
  TrophyIcon,
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  HistoryIcon,
  TrendingUpIcon,
  FactoryIcon,
  AlertTriangleIcon,
  TimerIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderCheckIcon,
} from "lucide-react";
import type { ParsedPurchaseItem, ItemCategory } from "@/types/purchase";
import { CATEGORY_LABELS } from "@/types/purchase";
import { getMonthLabel, monthKeyOf, byPurchaseDateAsc } from "@/utils/formatters";

export interface ReportExport {
  headers: (string | number)[];
  rows: (string | number)[][];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  getData: (items: ParsedPurchaseItem[]) => ReportExport;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

function groupBySupplier(items: ParsedPurchaseItem[]) {
  const grouped: Record<string, { count: number; qty: number; total: number }> =
    {};
  items.forEach((item) => {
    const name = item.supplierName || "-";
    if (!grouped[name]) {
      grouped[name] = { count: 0, qty: 0, total: 0 };
    }
    grouped[name].count += 1;
    grouped[name].qty += item.quantity;
    grouped[name].total += item.netTotal;
  });
  return grouped;
}

const EMPTY_EXPORT: ReportExport = { headers: [], rows: [] };

export const REPORTS: ReportDefinition[] = [
  {
    id: "purchase-summary",
    name: "Purchase Summary",
    description: "Seluruh transaksi pembelian per baris item",
    icon: LayoutDashboardIcon,
    getData: (items) => ({
      headers: [
        "No. Pembelian",
        "Tanggal",
        "No. PO",
        "Tanggal PO",
        "Supplier",
        "Kode Item",
        "Nama Item",
        "Kategori",
        "Gudang",
        "Qty",
        "Satuan",
        "Harga Satuan",
        "Net Total",
      ],
      rows: items.map((item) => [
        item.purchaseNumber,
        item.purchaseDate,
        item.poNumber,
        item.poDate,
        item.supplierName,
        item.itemCode,
        item.itemName,
        item.itemCategory,
        item.warehouse,
        item.quantity,
        item.uom,
        item.unitCost,
        item.netTotal,
      ]),
    }),
  },
  {
    id: "by-supplier",
    name: "Purchase by Supplier",
    description: "Total pembelian per supplier dalam periode",
    icon: Building2Icon,
    getData: (items) => {
      const grouped = groupBySupplier(items);
      const grandTotal = items.reduce((sum, i) => sum + i.netTotal, 0);
      const rows = Object.entries(grouped)
        .map(([name, d]) => [
          name,
          d.count,
          round2(d.qty),
          d.total,
          grandTotal > 0 ? round1((d.total / grandTotal) * 100) : 0,
        ])
        .sort((a, b) => (b[3] as number) - (a[3] as number));
      return {
        headers: [
          "Nama Supplier",
          "Jumlah Transaksi",
          "Total Qty",
          "Total Pembelian",
          "% dari Grand Total",
        ],
        rows,
      };
    },
  },
  {
    id: "ranking",
    name: "Supplier Ranking",
    description: "Peringkat supplier berdasarkan nilai pembelian",
    icon: TrophyIcon,
    getData: (items) => {
      const grouped = groupBySupplier(items);
      const grandTotal = items.reduce((sum, i) => sum + i.netTotal, 0);
      const sorted = Object.entries(grouped).sort(
        (a, b) => b[1].total - a[1].total,
      );
      const rows = sorted.map(([name, d], idx) => [
        idx + 1,
        name,
        d.total,
        d.count,
        grandTotal > 0 ? round1((d.total / grandTotal) * 100) : 0,
      ]);
      return {
        headers: [
          "Peringkat",
          "Nama Supplier",
          "Total Pembelian",
          "Jumlah Transaksi",
          "Kontribusi (%)",
        ],
        rows,
      };
    },
  },
  {
    id: "quality",
    name: "Supplier Quality",
    description: "Laporan kualitas supplier (reject/QC)",
    icon: ShieldCheckIcon,
    getData: () => EMPTY_EXPORT,
  },
  {
    id: "delivery",
    name: "Supplier Delivery Performance",
    description: "Waktu PO ke invoice dan keterlambatan per supplier",
    icon: TruckIcon,
    getData: (items) => {
      const grouped: Record<
        string,
        { poPiDays: number[]; overdueDays: number[] }
      > = {};
      items.forEach((item) => {
        const name = item.supplierName || "-";
        if (!grouped[name]) {
          grouped[name] = { poPiDays: [], overdueDays: [] };
        }
        if (item.poPiDays > 0) grouped[name].poPiDays.push(item.poPiDays);
        if (item.poPiOverdueDays > 0) {
          grouped[name].overdueDays.push(item.poPiOverdueDays);
        }
      });
      const rows = Object.entries(grouped)
        .map(([name, d]) => {
          const avgPoPiDays =
            d.poPiDays.length > 0
              ? d.poPiDays.reduce((a, b) => a + b, 0) / d.poPiDays.length
              : 0;
          const avgOverdueDays =
            d.overdueDays.length > 0
              ? d.overdueDays.reduce((a, b) => a + b, 0) / d.overdueDays.length
              : 0;
          return [
            name,
            round1(avgPoPiDays),
            round1(avgOverdueDays),
            d.overdueDays.length,
            d.poPiDays.length,
          ];
        })
        .sort((a, b) => (b[2] as number) - (a[2] as number));
      return {
        headers: [
          "Nama Supplier",
          "Rata-rata PO→Invoice (hari)",
          "Rata-rata Keterlambatan (hari)",
          "Jumlah Terlambat",
          "Total Transaksi",
        ],
        rows,
      };
    },
  },
  {
    id: "scorecard",
    name: "Supplier Scorecard",
    description: "Skor supplier: harga & ketepatan waktu (0-100)",
    icon: StarIcon,
    getData: (items) => {
      const grouped: Record<
        string,
        {
          items: ParsedPurchaseItem[];
          priceIncreases: number[];
          overdueCount: number;
          total: number;
        }
      > = {};
      items.forEach((item) => {
        const name = item.supplierName || "-";
        if (!grouped[name]) {
          grouped[name] = {
            items: [],
            priceIncreases: [],
            overdueCount: 0,
            total: 0,
          };
        }
        grouped[name].items.push(item);
        grouped[name].total += 1;
        if (item.poPiOverdueDays > 0) grouped[name].overdueCount += 1;
      });
      Object.values(grouped).forEach((data) => {
        const sorted = data.items
          .filter((i) => i.unitCost > 0)
          .sort(byPurchaseDateAsc);
        for (let i = 1; i < sorted.length; i++) {
          const increase =
            ((sorted[i].unitCost - sorted[i - 1].unitCost) /
              sorted[i - 1].unitCost) *
            100;
          if (increase >= 10) data.priceIncreases.push(increase);
        }
      });
      const rating = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        return "Perlu Perhatian";
      };
      const rows = Object.entries(grouped)
        .map(([name, data]) => {
          const onTime = data.total - data.overdueCount;
          const timelinessScore =
            data.total > 0 ? (onTime / data.total) * 100 : 50;
          const avgIncrease =
            data.priceIncreases.length > 0
              ? data.priceIncreases.reduce((a, b) => a + b, 0) /
                data.priceIncreases.length
              : 0;
          const priceScore = Math.max(
            0,
            100 - data.priceIncreases.length * 10 - avgIncrease / 2,
          );
          const totalScore = (priceScore + timelinessScore) / 2;
          return [
            name,
            Math.round(priceScore),
            Math.round(timelinessScore),
            Math.round(totalScore),
            rating(totalScore),
          ];
        })
        .sort((a, b) => (b[3] as number) - (a[3] as number));
      return {
        headers: [
          "Nama Supplier",
          "Skor Harga",
          "Skor Ketepatan Waktu",
          "Skor Total",
          "Rating",
        ],
        rows,
      };
    },
  },
  {
    id: "price-history",
    name: "Purchase Price History",
    description: "Riwayat harga per transaksi seluruh item",
    icon: HistoryIcon,
    getData: (items) => {
      const sorted = [...items].sort(byPurchaseDateAsc);
      return {
        headers: [
          "Tanggal",
          "No. Pembelian",
          "Supplier",
          "Nama Item",
          "Qty",
          "Satuan",
          "Harga Satuan",
          "Net Total",
        ],
        rows: sorted.map((item) => [
          item.purchaseDate,
          item.purchaseNumber,
          item.supplierName,
          item.itemName,
          item.quantity,
          item.uom,
          item.unitCost,
          item.netTotal,
        ]),
      };
    },
  },
  {
    id: "variance",
    name: "Purchase Variance",
    description: "Selisih qty pesan vs terima (variance ≠ 0)",
    icon: TrendingUpIcon,
    getData: (items) => {
      const rows = items
        .filter((item) => item.qtyOrdered > 0)
        .map((item) => ({
          ...item,
          variance: item.quantity - item.qtyOrdered,
        }))
        .filter((item) => item.variance !== 0)
        .map((item) => [
          item.purchaseDate,
          item.purchaseNumber,
          item.itemName,
          item.supplierName,
          item.qtyOrdered,
          item.quantity,
          item.variance,
        ]);
      return {
        headers: [
          "Tanggal",
          "No. Pembelian",
          "Nama Item",
          "Supplier",
          "Qty Dipesan",
          "Qty Diterima",
          "Selisih",
        ],
        rows,
      };
    },
  },
  {
    id: "material-cost",
    name: "Material Cost Trends",
    description: "Biaya material bulanan per kategori item (5 kategori)",
    icon: FactoryIcon,
    getData: (items) => {
      const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];
      const monthly: Record<
        string,
        { sampleDate: string; [key: string]: number | string }
      > = {};
      items.forEach((item) => {
        const month = monthKeyOf(item.purchaseDateObj);
        if (!month) return;
        if (!monthly[month]) {
          monthly[month] = { sampleDate: item.purchaseDate };
          categories.forEach((cat) => {
            monthly[month][cat] = 0;
          });
        }
        monthly[month][item.itemCategory] =
          ((monthly[month][item.itemCategory] as number) || 0) + item.netTotal;
      });
      const rows = Object.entries(monthly)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([_, d]) => [
          getMonthLabel(d.sampleDate),
          ...categories.map((cat) => (d[cat] as number) ?? 0),
          categories.reduce((sum, cat) => sum + ((d[cat] as number) ?? 0), 0),
        ]);
      return {
        headers: [
          "Bulan",
          ...categories.map((cat) => CATEGORY_LABELS[cat]),
          "Total",
        ],
        rows,
      };
    },
  },
  {
    id: "price-alert",
    name: "Price Increase Alert",
    description: "Item dengan kenaikan harga berurutan ≥ 10%",
    icon: AlertTriangleIcon,
    getData: (items) => {
      const grouped: Record<string, ParsedPurchaseItem[]> = {};
      items.forEach((item) => {
        if (!grouped[item.itemName]) grouped[item.itemName] = [];
        grouped[item.itemName].push(item);
      });
      const result: (string | number)[][] = [];
      Object.values(grouped).forEach((itemGroup) => {
        const sorted = itemGroup
          .filter((i) => i.unitCost > 0)
          .sort(byPurchaseDateAsc);
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          const increase =
            ((curr.unitCost - prev.unitCost) / prev.unitCost) * 100;
          if (increase >= 10) {
            result.push([
              curr.itemName,
              curr.supplierName,
              prev.purchaseDate,
              prev.unitCost,
              curr.purchaseDate,
              curr.unitCost,
              round1(increase),
            ]);
          }
        }
      });
      result.sort((a, b) => (b[6] as number) - (a[6] as number));
      return {
        headers: [
          "Nama Item",
          "Supplier",
          "Tanggal Sebelumnya",
          "Harga Sebelumnya",
          "Tanggal Terbaru",
          "Harga Terbaru",
          "Kenaikan (%)",
        ],
        rows: result,
      };
    },
  },
  {
    id: "lead-time",
    name: "Supplier Lead Time",
    description: "Durasi PR & PO sampai invoice per transaksi",
    icon: TimerIcon,
    getData: (items) => {
      const rows = items
        .filter((item) => item.prPiDays > 0 || item.poPiDays > 0)
        .map((item) => [
          item.prNumber,
          item.prDate,
          item.poNumber,
          item.poDate,
          item.purchaseNumber,
          item.purchaseDate,
          item.prPiDays,
          item.poPiDays,
        ]);
      return {
        headers: [
          "No. PR",
          "Tanggal PR",
          "No. PO",
          "Tanggal PO",
          "No. Pembelian",
          "Tanggal Pembelian",
          "PR→Invoice (hari)",
          "PO→Invoice (hari)",
        ],
        rows,
      };
    },
  },
  {
    id: "outstanding-po",
    name: "Outstanding PO",
    description: "PO yang masih belum ditutup",
    icon: ClipboardListIcon,
    getData: () => EMPTY_EXPORT,
  },
  {
    id: "open-po",
    name: "Open PO",
    description: "Daftar PO yang masih berstatus terbuka",
    icon: FileTextIcon,
    getData: () => EMPTY_EXPORT,
  },
  {
    id: "closed-po",
    name: "Closed PO",
    description: "Daftar PO yang sudah ditutup",
    icon: FolderCheckIcon,
    getData: () => EMPTY_EXPORT,
  },
];
