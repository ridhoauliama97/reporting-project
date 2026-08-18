import type {
  ParsedPurchaseItem,
  PurchaseOrder,
  StockBalance,
} from "@/types/purchase";
import {
  formatRupiah,
  formatRupiahCompact,
  formatNumber,
  formatPercent,
  formatDate,
  getMonthLabel,
  monthKeyOf,
  byPurchaseDateAsc,
} from "@/utils/formatters";
import { REPORTS } from "@/utils/reports";

export type UrgencyLevel = "Info" | "Perhatian" | "Urgent";

export interface Recommendation {
  id: string;
  level: UrgencyLevel;
  title: string;
  message: string;
  sourceReportId: string;
}

export interface Anomaly {
  id: string;
  severity: "Perhatian" | "Urgent";
  title: string;
  message: string;
  sourceReportId: string;
}

export interface SpendInsight {
  id: string;
  title: string;
  message: string;
  estimatedSaving: number;
  sourceReportId: string;
}

export interface ChatAnswer {
  text: string;
  sources: string[];
  followUp?: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

const PRICE_ANOMALY_THRESHOLD = 0.3;
const PRICE_ANOMALY_URGENT_THRESHOLD = 0.6;
const VOLUME_SPIKE_THRESHOLD = 0.4;
const SPEND_SPIKE_THRESHOLD = 0.4;
const OVERDUE_RATE_THRESHOLD = 0.5;
const FREQUENCY_THRESHOLD = 12;
const CONCENTRATION_URGENT = 0.5;
const CONCENTRATION_PERHATIAN = 0.35;
const LATE_COUNT_URGENT = 5;
const LATE_COUNT_PERHATIAN = 3;
const PRICE_HIKE_URGENT = 0.4;
const PRICE_HIKE_PERHATIAN = 0.2;
const NEGATIVE_VARIANCE_ALERT = 5;
const LOW_SCORE_SUPPLIER_ALERT = 2;
const CONSOLIDATION_MIN_TRANSACTIONS = 3;
const CONSOLIDATION_MIN_TOTAL = 10_000_000;
const MULTI_SUPPLIER_MIN = 3;
const SMALL_PO_THRESHOLD = 1_000_000;
const SMALL_PO_ALERT = 20;
const CATEGORY_DOMINANCE_THRESHOLD = 0.5;

function sum(items: ParsedPurchaseItem[], field: "netTotal" | "quantity") {
  return items.reduce((acc, i) => acc + i[field], 0);
}

function groupBySupplier(items: ParsedPurchaseItem[]) {
  const grouped: Record<
    string,
    {
      count: number;
      total: number;
      overdueCount: number;
      overdueDays: number[];
      poPiDays: number[];
    }
  > = {};
  items.forEach((item) => {
    const name = item.supplierName || "-";
    if (!grouped[name]) {
      grouped[name] = {
        count: 0,
        total: 0,
        overdueCount: 0,
        overdueDays: [],
        poPiDays: [],
      };
    }
    grouped[name].count += 1;
    grouped[name].total += item.netTotal;
    if (item.poPiOverdueDays > 0) {
      grouped[name].overdueCount += 1;
      grouped[name].overdueDays.push(item.poPiOverdueDays);
    }
    if (item.poPiDays > 0) grouped[name].poPiDays.push(item.poPiDays);
  });
  return grouped;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface SupplierScore {
  supplierName: string;
  priceScore: number;
  timelinessScore: number;
  totalScore: number;
  rating: string;
}

export function getRating(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Perlu Perhatian";
}

export function computeSupplierScores(
  items: ParsedPurchaseItem[],
): SupplierScore[] {
  const grouped: Record<
    string,
    {
      items: ParsedPurchaseItem[];
      priceIncreases: number[];
      overdueDays: number[];
      totalTransactions: number;
    }
  > = {};

  items.forEach((item) => {
    const name = item.supplierName || "-";
    if (!grouped[name]) {
      grouped[name] = {
        items: [],
        priceIncreases: [],
        overdueDays: [],
        totalTransactions: 0,
      };
    }
    grouped[name].items.push(item);
    grouped[name].totalTransactions += 1;
    if (item.poPiOverdueDays > 0) {
      grouped[name].overdueDays.push(item.poPiOverdueDays);
    }
  });

  Object.entries(grouped).forEach(([, data]) => {
    const sorted = data.items
      .filter((i) => i.unitCost > 0)
      .sort(byPurchaseDateAsc);

    for (let i = 1; i < sorted.length; i++) {
      const increase =
        ((sorted[i].unitCost - sorted[i - 1].unitCost) /
          sorted[i - 1].unitCost) *
        100;
      if (increase >= 10) {
        data.priceIncreases.push(increase);
      }
    }
  });

  return Object.entries(grouped)
    .map(([name, data]) => {
      const onTimeTransactions =
        data.totalTransactions - data.overdueDays.length;
      const timelinessScore =
        data.totalTransactions > 0
          ? (onTimeTransactions / data.totalTransactions) * 100
          : 50;

      const priceIncreaseCount = data.priceIncreases.length;
      const avgIncrease =
        data.priceIncreases.length > 0
          ? data.priceIncreases.reduce((a, b) => a + b, 0) /
            data.priceIncreases.length
          : 0;
      const priceScore = Math.max(
        0,
        100 - priceIncreaseCount * 10 - avgIncrease / 2,
      );

      const totalScore = (priceScore + timelinessScore) / 2;

      return {
        supplierName: name,
        priceScore: Math.round(priceScore),
        timelinessScore: Math.round(timelinessScore),
        totalScore: Math.round(totalScore),
        rating: getRating(totalScore),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function getVarianceRows(items: ParsedPurchaseItem[]) {
  return items
    .filter((i) => i.qtyOrdered > 0)
    .map((i) => ({ ...i, variance: i.quantity - i.qtyOrdered }))
    .filter((i) => i.variance !== 0);
}

function getPeriodLabel(items: ParsedPurchaseItem[]): string {
  if (items.length === 0) return "periode ini";
  const dates = items
    .map((i) => i.purchaseDate)
    .filter(Boolean)
    .sort();
  if (dates.length === 0) return "periode ini";
  const first = formatDate(dates[0]);
  const last = formatDate(dates[dates.length - 1]);
  return first === last ? first : `${first} – ${last}`;
}

const PLACEHOLDER_REPORT_IDS = new Set(["quality"]);

function placeholderSummary(reportId: string, items: ParsedPurchaseItem[]): string {
  const report = REPORTS.find((r) => r.id === reportId);
  const name = report ? report.name : "Laporan ini";
  if (items.length === 0) {
    return `Tidak ada transaksi pada rentang tanggal aktif, sehingga ringkasan ${name} tidak dapat dibuat.`;
  }
  return `Dataset purchasing saat ini belum memuat data ${name.toLowerCase()} (data reject/QC tidak tercatat pada dataset pembelian). Halaman laporan ini sengaja dikosongkan sampai data terkait tersedia.`;
}

function purchaseOrderSummary(
  orders: PurchaseOrder[],
  status: "OPEN" | "OUTSTANDING" | "CLOSED",
  label: string,
  period: string,
): string {
  const rows = orders.filter((po) => po.status === status);
  if (rows.length === 0) {
    return `Periode ${period}: tidak ada PO berstatus ${label}.`;
  }
  const totalValue = rows.reduce((s, po) => s + po.orderNetTotal, 0);
  const outstandingQty = rows.reduce(
    (s, po) => s + po.lines.reduce((a, l) => a + l.qtyOutstanding, 0),
    0,
  );
  const topSupplier = Object.entries(
    rows.reduce<Record<string, number>>((acc, po) => {
      const name = po.supplierName || "-";
      acc[name] = (acc[name] || 0) + po.orderNetTotal;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1])[0];
  const lines = rows.reduce((s, po) => s + po.lines.length, 0);
  let text = `Periode ${period}: ${formatNumber(rows.length)} PO berstatus ${label} (${formatNumber(lines)} baris item) dengan total nilai ${formatRupiahCompact(totalValue)}`;
  if (status !== "CLOSED") {
    text += ` dan ${formatNumber(round2(outstandingQty))} unit belum diterima`;
  }
  if (topSupplier) {
    text += `. Supplier terbesar: ${topSupplier[0]} (${formatRupiahCompact(topSupplier[1])})`;
  }
  text += ".";
  return text;
}

export function generateReportSummary(
  reportId: string,
  items: ParsedPurchaseItem[],
  purchaseOrders?: PurchaseOrder[],
): string {
  if (PLACEHOLDER_REPORT_IDS.has(reportId)) {
    return placeholderSummary(reportId, items);
  }
  const period = getPeriodLabel(items);
  if (items.length === 0) {
    return `Tidak ada transaksi pada rentang tanggal aktif, sehingga ringkasan laporan tidak dapat dibuat.`;
  }
  if (reportId === "outstanding-po") {
    return purchaseOrderSummary(purchaseOrders ?? [], "OUTSTANDING", "Outstanding", period);
  }
  if (reportId === "open-po") {
    return purchaseOrderSummary(purchaseOrders ?? [], "OPEN", "Open", period);
  }
  if (reportId === "closed-po") {
    return purchaseOrderSummary(purchaseOrders ?? [], "CLOSED", "Closed", period);
  }

  switch (reportId) {
    case "purchase-summary": {
      const total = sum(items, "netTotal");
      const suppliers = new Set(items.map((i) => i.supplierName)).size;
      const categories: Record<string, number> = {};
      items.forEach((i) => {
        categories[i.itemCategory] = (categories[i.itemCategory] || 0) + i.netTotal;
      });
      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      return `Kesimpulan periode ${period}: ${formatNumber(items.length)} transaksi pembelian senilai ${formatRupiahCompact(total)} dari ${formatNumber(suppliers)} supplier. Kategori terbesar adalah ${topCategory[0]} (${formatRupiahCompact(topCategory[1])}).`;
    }
    case "by-supplier": {
      const grouped = groupBySupplier(items);
      const total = sum(items, "netTotal");
      const top = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)[0];
      if (!top) return "Tidak ada data supplier pada periode ini.";
      const share = total > 0 ? (top[1].total / total) * 100 : 0;
      return `Periode ${period}: ${formatNumber(Object.keys(grouped).length)} supplier aktif dengan total pembelian ${formatRupiahCompact(total)}. ${top[0]} adalah supplier terbesar (${formatRupiahCompact(top[1].total)}, ${formatPercent(share)} dari total, ${formatNumber(top[1].count)} transaksi).`;
    }
    case "ranking": {
      const grouped = groupBySupplier(items);
      const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
      if (sorted.length === 0) return "Tidak ada data supplier pada periode ini.";
      const top3 = sorted.slice(0, 3);
      const list = top3
        .map(
          ([name, d], idx) =>
            `(${idx + 1}) ${name} ${formatRupiahCompact(d.total)}`,
        )
        .join(", ");
      return `Periode ${period}, peringkat supplier berdasarkan nilai pembelian: ${list}.`;
    }
    case "delivery": {
      const grouped = groupBySupplier(items);
      const rows = Object.entries(grouped)
        .filter(([, d]) => d.poPiDays.length > 0 || d.overdueCount > 0)
        .sort((a, b) => b[1].overdueCount - a[1].overdueCount);
      if (rows.length === 0) {
        return `Periode ${period}: tidak ada data waktu pengiriman (PO→invoice) yang tercatat pada rentang ini.`;
      }
      const totalOverdue = rows.reduce((a, [, d]) => a + d.overdueCount, 0);
      const avgPoPi = round1(
        avg(rows.flatMap(([, d]) => d.poPiDays)),
      );
      const worst = rows[0];
      return `Periode ${period}: rata-rata waktu PO→invoice ${avgPoPi} hari dengan ${formatNumber(totalOverdue)} transaksi terlambat. Supplier paling sering terlambat: ${worst[0]} (${formatNumber(worst[1].overdueCount)}x, rata-rata ${round1(avg(worst[1].overdueDays))} hari).`;
    }
    case "scorecard": {
      const rows = computeSupplierScores(items);
      if (rows.length === 0) return "Tidak ada data scorecard pada periode ini.";
      const best = rows[0];
      const worst = rows[rows.length - 1];
      const avgScore = round1(avg(rows.map((r) => r.totalScore)));
      return `Periode ${period}: skor rata-rata supplier ${avgScore} dari 100 (rata-rata skor harga & ketepatan waktu). Terbaik: ${best.supplierName} (${best.totalScore}, ${best.rating}); terendah: ${worst.supplierName} (${worst.totalScore}, ${worst.rating}).`;
    }
    case "price-history": {
      const itemsWithPrice = items.filter((i) => i.unitCost > 0);
      if (itemsWithPrice.length === 0) {
        return `Periode ${period}: tidak ada data harga satuan pada rentang ini.`;
      }
      const maxItem = itemsWithPrice.reduce((a, b) =>
        b.unitCost > a.unitCost ? b : a,
      );
      return `Periode ${period}: ${formatNumber(itemsWithPrice.length)} transaksi memiliki data harga satuan. Harga tertinggi: ${maxItem.itemName} ${formatRupiahCompact(maxItem.unitCost)}/${maxItem.uom} (${maxItem.supplierName}).`;
    }
    case "variance": {
      const rows = getVarianceRows(items);
      if (rows.length === 0) {
        return `Periode ${period}: seluruh ${formatNumber(items.length)} transaksi sesuai dengan qty yang dipesan — tidak ada selisih terdeteksi.`;
      }
      const neg = rows.filter((r) => r.variance < 0);
      const totalDiff = rows.reduce((a, r) => a + r.variance, 0);
      return `Periode ${period}: ${formatNumber(rows.length)} transaksi memiliki selisih qty (${formatNumber(neg.length)} diterima kurang, ${formatNumber(rows.length - neg.length)} lebih). Total selisih ${formatNumber(round2(totalDiff))} unit.`;
    }
    case "material-cost": {
      const categoryTotals: Record<string, number> = {};
      const monthTotals: Record<string, number> = {};
      items.forEach((i) => {
        categoryTotals[i.itemCategory] =
          (categoryTotals[i.itemCategory] || 0) + i.netTotal;
        const monthKey = monthKeyOf(i.purchaseDateObj);
        if (monthKey) {
          monthTotals[monthKey] = (monthTotals[monthKey] || 0) + i.netTotal;
        }
      });
      const total = sum(items, "netTotal");
      const categoryList = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([c, v]) => `${c}: ${formatRupiahCompact(v)}`)
        .join(", ");
      const months = Object.keys(monthTotals).sort();
      const avgPerMonth = months.length > 0 ? total / months.length : 0;
      const highestMonth = months
        .map((m) => ({ m, v: monthTotals[m] }))
        .sort((a, b) => b.v - a.v)[0];
      return `Periode ${period}: biaya material total ${formatRupiahCompact(total)} dari ${formatNumber(items.length)} transaksi, mencakup seluruh kategori. Per kategori: ${categoryList}. Rata-rata ${formatRupiahCompact(avgPerMonth)}/bulan; puncak di ${highestMonth ? getMonthLabel(highestMonth.m) : "-"} (${highestMonth ? formatRupiahCompact(highestMonth.v) : "-"}).`;
    }
    case "price-alert": {
      const grouped: Record<string, ParsedPurchaseItem[]> = {};
      items.forEach((item) => {
        if (!grouped[item.itemName]) grouped[item.itemName] = [];
        grouped[item.itemName].push(item);
      });
      const alerts: { item: string; increase: number; prev: number; curr: number }[] = [];
      Object.values(grouped).forEach((itemGroup) => {
        const sorted = itemGroup
          .filter((i) => i.unitCost > 0)
          .sort(byPurchaseDateAsc);
        for (let i = 1; i < sorted.length; i++) {
          const increase = (sorted[i].unitCost - sorted[i - 1].unitCost) / sorted[i - 1].unitCost;
          if (increase >= 0.1) {
            alerts.push({
              item: sorted[i].itemName,
              increase,
              prev: sorted[i - 1].unitCost,
              curr: sorted[i].unitCost,
            });
          }
        }
      });
      if (alerts.length === 0) {
        return `Periode ${period}: tidak ada kenaikan harga berurutan ≥ 10% yang terdeteksi.`;
      }
      alerts.sort((a, b) => b.increase - a.increase);
      const top = alerts[0];
      return `Periode ${period}: ${formatNumber(alerts.length)} kenaikan harga ≥ 10% terdeteksi. Paling ekstrem: ${top.item} naik ${formatPercent(top.increase * 100)} (${formatRupiahCompact(top.prev)} → ${formatRupiahCompact(top.curr)} per unit).`;
    }
    case "lead-time": {
      const rows = items.filter(
        (i) => i.requiredPrDays > 0 || i.prPoDays > 0 || i.poPiDays > 0,
      );
      if (rows.length === 0) {
        return `Periode ${period}: tidak ada data durasi Required/PR/PO→invoice pada rentang ini.`;
      }
      const avgReq = round1(
        avg(rows.map((r) => r.requiredPrDays).filter((d) => d > 0)),
      );
      const avgPr = round1(avg(rows.map((r) => r.prPoDays).filter((d) => d > 0)));
      const avgPo = round1(avg(rows.map((r) => r.poPiDays).filter((d) => d > 0)));
      return `Periode ${period}: rata-rata lead time Required→PR ${avgReq} hari, PR→PO ${avgPr} hari, dan PO→invoice ${avgPo} hari dari ${formatNumber(rows.length)} transaksi.`;
    }
    default:
      return `Ringkasan untuk laporan ini belum tersedia.`;
  }
}

export function generateOverallSummary(
  items: ParsedPurchaseItem[],
  allItems: ParsedPurchaseItem[],
): string {
  if (items.length === 0) {
    return "Tidak ada transaksi pada rentang tanggal aktif, sehingga ringkasan keseluruhan tidak dapat dibuat.";
  }
  const period = getPeriodLabel(items);
  const total = sum(items, "netTotal");
  const count = items.length;
  const grouped = groupBySupplier(items);
  const suppliers = Object.keys(grouped).length;

  const categoryTotals: Record<string, number> = {};
  items.forEach((i) => {
    categoryTotals[i.itemCategory] =
      (categoryTotals[i.itemCategory] || 0) + i.netTotal;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const topSupplier = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total)[0];
  const topShare = total > 0 && topSupplier ? (topSupplier[1].total / total) * 100 : 0;

  const overdueCount = Object.values(grouped).reduce(
    (acc, d) => acc + d.overdueCount,
    0,
  );
  const lateRate = count > 0 ? (overdueCount / count) * 100 : 0;

  const leadRows = items.filter(
    (i) => i.requiredPrDays > 0 || i.prPoDays > 0 || i.poPiDays > 0,
  );
  const avgReq = leadRows.length
    ? round1(avg(leadRows.map((r) => r.requiredPrDays).filter((d) => d > 0)))
    : 0;
  const avgPr = leadRows.length
    ? round1(avg(leadRows.map((r) => r.prPoDays).filter((d) => d > 0)))
    : 0;
  const avgPo = leadRows.length
    ? round1(avg(leadRows.map((r) => r.poPiDays).filter((d) => d > 0)))
    : 0;

  const alerts = priceIncreaseAlerts(items);
  const varianceRows = items
    .filter((i) => i.qtyOrdered > 0)
    .map((i) => ({ ...i, variance: i.quantity - i.qtyOrdered }))
    .filter((i) => i.variance !== 0);
  const anomalies = detectAnomalies(items, allItems);
  const urgentAnomalies = anomalies.filter((a) => a.severity === "Urgent");

  let text = `Periode ${period}: total pembelian ${formatRupiah(total)} dari ${formatNumber(count)} transaksi dengan ${formatNumber(suppliers)} supplier aktif. `;
  if (topCategory) {
    text += `Kategori terbesar: ${topCategory[0]} (${formatPercent((topCategory[1] / total) * 100)} dari total). `;
  }
  if (topSupplier) {
    text += `Supplier terbesar: ${topSupplier[0]} (${formatRupiah(topSupplier[1].total)}, ${formatPercent(topShare)}). `;
  }
  text += `Tingkat keterlambatan ${formatPercent(lateRate)} (${formatNumber(overdueCount)} dari ${formatNumber(count)} transaksi)`;
  if (leadRows.length > 0) {
    text += `; rata-rata lead time Required→PR ${avgReq} hari, PR→PO ${avgPr} hari, PO→invoice ${avgPo} hari`;
  }
  text += `. Terdeteksi ${formatNumber(alerts.length)} kenaikan harga ≥ 10%, ${formatNumber(varianceRows.length)} transaksi dengan selisih qty, dan ${formatNumber(anomalies.length)} anomali (${formatNumber(urgentAnomalies.length)} urgent).`;
  return text;
}

export function generateRecommendations(
  items: ParsedPurchaseItem[],
  allItems: ParsedPurchaseItem[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const period = getPeriodLabel(items);
  if (items.length === 0) return recommendations;

  const grouped = groupBySupplier(items);
  const total = sum(items, "netTotal");
  const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total);
  const top = sorted[0];

  if (top && total > 0) {
    const share = top[1].total / total;
    if (share >= CONCENTRATION_URGENT) {
      recommendations.push({
        id: "concentration",
        level: "Urgent",
        title: "Ketergantungan tinggi pada satu supplier",
        message: `Pembelian periode ${period} terkonsentrasi pada ${top[0]}: ${formatPercent(share * 100)} dari total (${formatRupiahCompact(top[1].total)} dari ${formatRupiahCompact(total)}). Pertimbangkan diversifikasi supplier untuk mengurangi risiko pasokan.`,
        sourceReportId: "by-supplier",
      });
    } else if (share >= CONCENTRATION_PERHATIAN) {
      recommendations.push({
        id: "concentration",
        level: "Perhatian",
        title: "Konsentrasi pembelian cukup tinggi",
        message: `${top[0]} menguasai ${formatPercent(share * 100)} pembelian periode ${period}. Pantau performa supplier ini secara berkala.`,
        sourceReportId: "by-supplier",
      });
    }
  }

  const lateSuppliers = sorted
    .filter(([, d]) => d.overdueCount >= LATE_COUNT_PERHATIAN)
    .sort((a, b) => b[1].overdueCount - a[1].overdueCount);
  const worstLate = lateSuppliers[0];
  if (worstLate) {
    const d = worstLate[1];
    const level: UrgencyLevel =
      d.overdueCount >= LATE_COUNT_URGENT ? "Urgent" : "Perhatian";
    recommendations.push({
      id: "late-supplier",
      level,
      title: `${worstLate[0]} sering terlambat`,
      message: `${worstLate[0]} mencatat ${formatNumber(d.overdueCount)}x keterlambatan periode ${period} (rata-rata ${round1(avg(d.overdueDays))} hari). Pertimbangkan evaluasi kontrak atau cari supplier alternatif.`,
      sourceReportId: "delivery",
    });
  }

  const alerts = priceIncreaseAlerts(items);
  const topAlert = alerts[0];
  if (topAlert && topAlert.increase >= PRICE_HIKE_PERHATIAN) {
    const level: UrgencyLevel =
      topAlert.increase >= PRICE_HIKE_URGENT ? "Urgent" : "Perhatian";
    recommendations.push({
      id: "price-hike",
      level,
      title: `Harga ${topAlert.item} melonjak`,
      message: `${topAlert.item} naik ${formatPercent(topAlert.increase * 100)} (${formatRupiahCompact(topAlert.prev)} → ${formatRupiahCompact(topAlert.curr)} per unit) periode ${period}. Negosiasikan harga atau cari alternatif pemasok.`,
      sourceReportId: "price-alert",
    });
  }

  const varianceRows = getVarianceRows(items);
  const negVariance = varianceRows.filter((r) => r.variance < 0);
  if (negVariance.length >= NEGATIVE_VARIANCE_ALERT) {
    const totalShortage = round2(negVariance.reduce((a, r) => a + r.variance, 0));
    recommendations.push({
      id: "negative-variance",
      level: "Perhatian",
      title: "Banyak kiriman kurang dari pesanan",
      message: `${formatNumber(negVariance.length)} transaksi periode ${period} menerima qty lebih sedikit dari pesanan (total selisih ${formatNumber(totalShortage)} unit). Verifikasi proses penerimaan dan penagihan ke supplier terkait.`,
      sourceReportId: "variance",
    });
  }

  const lowScoreSuppliers = lowScoreSupplierNames(items);
  if (lowScoreSuppliers.length >= LOW_SCORE_SUPPLIER_ALERT) {
    recommendations.push({
      id: "low-score",
      level: "Perhatian",
      title: "Beberapa supplier berperingkat rendah",
      message: `${formatNumber(lowScoreSuppliers.length)} supplier berrating "Perlu Perhatian" pada periode ${period}: ${lowScoreSuppliers.join(", ")}. Prioritaskan perbaikan performa mereka.`,
      sourceReportId: "scorecard",
    });
  }

  const consolidation = topConsolidationCandidate(items);
  if (consolidation) {
    recommendations.push({
      id: "consolidation",
      level: "Info",
      title: "Peluang konsolidasi PO",
      message: `${consolidation.supplier} memiliki ${formatNumber(consolidation.count)} transaksi terpisah periode ${period} (total ${formatRupiahCompact(consolidation.total)}). Menggabungkannya menjadi satu PO per periode berpotensi mendapatkan diskon volume.`,
      sourceReportId: "by-supplier",
    });
  }

  if (recommendations.length === 0) {
    const months = new Set(
      allItems.map((i) => monthKeyOf(i.purchaseDateObj)).filter(Boolean),
    );
    const monthCount = months.size || 1;
    const monthlyCount = allItems.length / monthCount;
    const avgTotal = sum(allItems, "netTotal") / monthCount;
    recommendations.push({
      id: "steady",
      level: "Info",
      title: "Pola pembelian normal",
      message: `Pola pembelian periode ${period} (${formatNumber(items.length)} transaksi, ${formatRupiahCompact(total)}) konsisten dengan rata-rata historis (${formatNumber(round1(monthlyCount))} transaksi, ${formatRupiahCompact(avgTotal)} per bulan). Tidak ada anomali signifikan.`,
      sourceReportId: "purchase-summary",
    });
  }

  const order = { Urgent: 0, Perhatian: 1, Info: 2 } as const;
  return recommendations.sort(
    (a, b) => order[a.level] - order[b.level],
  );
}

export function priceIncreaseAlerts(items: ParsedPurchaseItem[]) {
  const grouped: Record<string, ParsedPurchaseItem[]> = {};
  items.forEach((item) => {
    if (!grouped[item.itemName]) grouped[item.itemName] = [];
    grouped[item.itemName].push(item);
  });
  const alerts: {
    item: string;
    increase: number;
    prev: number;
    curr: number;
  }[] = [];
  Object.values(grouped).forEach((itemGroup) => {
    const sorted = itemGroup
      .filter((i) => i.unitCost > 0)
      .sort(byPurchaseDateAsc);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.unitCost === prev.unitCost) continue;
      const increase = (curr.unitCost - prev.unitCost) / prev.unitCost;
      if (increase >= 0.1) {
        alerts.push({ item: curr.itemName, increase, prev: prev.unitCost, curr: curr.unitCost });
      }
    }
  });
  alerts.sort((a, b) => b.increase - a.increase);
  return alerts;
}

function lowScoreSupplierNames(items: ParsedPurchaseItem[]): string[] {
  return computeSupplierScores(items)
    .filter((s) => s.totalScore < 60)
    .map((s) => s.supplierName);
}

function topConsolidationCandidate(items: ParsedPurchaseItem[]) {
  const grouped = groupBySupplier(items);
  const sorted = Object.entries(grouped)
    .filter(([, d]) => d.count >= CONSOLIDATION_MIN_TRANSACTIONS)
    .filter(([, d]) => d.total >= CONSOLIDATION_MIN_TOTAL)
    .sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) return null;
  return {
    supplier: sorted[0][0],
    count: sorted[0][1].count,
    total: sorted[0][1].total,
  };
}

export function detectAnomalies(
  items: ParsedPurchaseItem[],
  allItems: ParsedPurchaseItem[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const period = getPeriodLabel(items);
  if (items.length === 0) return anomalies;

  const periodStart = items
    .map((i) => i.purchaseDate)
    .filter(Boolean)
    .sort()[0];

  const baselineMonths = new Set<string>();
  if (periodStart) {
    const start = new Date(periodStart);
    for (let m = 1; m <= 3; m++) {
      const d = new Date(start.getFullYear(), start.getMonth() - m, 1);
      baselineMonths.add(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      );
    }
  }
  const baselineItems = baselineMonths.size
    ? allItems.filter(
        (i) => baselineMonths.has(monthKeyOf(i.purchaseDateObj)),
      )
    : allItems.filter((i) => !items.includes(i));
  const inPeriod = new Set(items);
  const baselineByName: Record<string, ParsedPurchaseItem[]> = {};
  baselineItems.forEach((i) => {
    if (i.unitCost <= 0 || inPeriod.has(i)) return;
    if (!baselineByName[i.itemName]) baselineByName[i.itemName] = [];
    baselineByName[i.itemName].push(i);
  });

  const priceAnomalies: {
    item: string;
    deviation: number;
    baseline: number;
    current: number;
  }[] = [];
  const groupedByName: Record<string, ParsedPurchaseItem[]> = {};
  items.forEach((i) => {
    if (!groupedByName[i.itemName]) groupedByName[i.itemName] = [];
    groupedByName[i.itemName].push(i);
  });
  Object.entries(groupedByName).forEach(([name, periodRows]) => {
    const currentRows = periodRows.filter((i) => i.unitCost > 0);
    if (currentRows.length === 0) return;
    const current = avg(currentRows.map((i) => i.unitCost));
    const baselineRows = baselineByName[name] ?? [];
    if (baselineRows.length === 0) return;
    const baseline = avg(baselineRows.map((i) => i.unitCost));
    if (baseline <= 0) return;
    const deviation = (current - baseline) / baseline;
    if (deviation >= PRICE_ANOMALY_THRESHOLD) {
      priceAnomalies.push({ item: name, deviation, baseline, current });
    }
  });
  priceAnomalies.sort((a, b) => b.deviation - a.deviation);
  priceAnomalies.slice(0, 4).forEach((a) => {
    anomalies.push({
      id: `price-${a.item}`,
      severity: a.deviation >= PRICE_ANOMALY_URGENT_THRESHOLD ? "Urgent" : "Perhatian",
      title: `Harga ${a.item} melonjak dari rata-rata historis`,
      message: `Harga ${a.item} naik ${formatPercent(a.deviation * 100)} dibanding rata-rata 3 bulan sebelumnya (${formatRupiahCompact(a.baseline)} → ${formatRupiahCompact(a.current)} per unit) pada periode ${period}.`,
      sourceReportId: "price-alert",
    });
  });

  const months = new Set(allItems.map((i) => monthKeyOf(i.purchaseDateObj)).filter(Boolean));
  const monthCount = months.size;
  if (monthCount > 0) {
    const avgMonthlyCount = allItems.length / monthCount;
    const periodCount = items.length;
    const volumeSpike = avgMonthlyCount > 0 ? periodCount / avgMonthlyCount - 1 : 0;
    if (volumeSpike >= VOLUME_SPIKE_THRESHOLD) {
      anomalies.push({
        id: "volume-spike",
        severity: "Perhatian",
        title: "Volume transaksi di atas rata-rata",
        message: `Jumlah transaksi periode ${period} (${formatNumber(periodCount)}) lebih tinggi ${formatPercent(volumeSpike * 100)} dari rata-rata bulanan (${formatNumber(round1(avgMonthlyCount))}). Periksa apakah ini permintaan mendadak atau pola musiman.`,
        sourceReportId: "purchase-summary",
      });
    }
    const avgMonthlySpend = sum(allItems, "netTotal") / monthCount;
    const periodSpend = sum(items, "netTotal");
    const spendSpike = avgMonthlySpend > 0 ? periodSpend / avgMonthlySpend - 1 : 0;
    if (spendSpike >= SPEND_SPIKE_THRESHOLD) {
      anomalies.push({
        id: "spend-spike",
        severity: "Perhatian",
        title: "Total pengeluaran jauh di atas rata-rata",
        message: `Pengeluaran periode ${period} (${formatRupiahCompact(periodSpend)}) lebih tinggi ${formatPercent(spendSpike * 100)} dari rata-rata bulanan (${formatRupiahCompact(avgMonthlySpend)}).`,
        sourceReportId: "by-supplier",
      });
    }
  }

  const grouped = groupBySupplier(items);
  Object.entries(grouped).forEach(([name, d]) => {
    const rate = d.count > 0 ? d.overdueCount / d.count : 0;
    if (d.overdueCount >= 3 && rate >= OVERDUE_RATE_THRESHOLD) {
      anomalies.push({
        id: `overdue-${name}`,
        severity: d.overdueCount >= LATE_COUNT_URGENT ? "Urgent" : "Perhatian",
        title: `Tingkat keterlambatan ${name} tinggi`,
        message: `${name} terlambat pada ${formatNumber(d.overdueCount)} dari ${formatNumber(d.count)} transaksi (${formatPercent(rate * 100)}) periode ${period}, rata-rata ${round1(avg(d.overdueDays))} hari per keterlambatan.`,
        sourceReportId: "delivery",
      });
    }
  });

  const freqByName: Record<string, number> = {};
  items.forEach((i) => {
    freqByName[i.itemName] = (freqByName[i.itemName] || 0) + 1;
  });
  const freqAnomalies = Object.entries(freqByName)
    .filter(([, count]) => count >= FREQUENCY_THRESHOLD)
    .sort((a, b) => b[1] - a[1]);
  freqAnomalies.slice(0, 2).forEach(([name, count]) => {
    anomalies.push({
      id: `frequency-${name}`,
      severity: "Perhatian",
      title: `Frekuensi pembelian ${name} sangat tinggi`,
      message: `${name} dibeli ${formatNumber(count)}x dalam periode ${period}. Pertimbangkan pengadaan kontrak atau penjadwalan pembelian.`,
      sourceReportId: "price-history",
    });
  });

  const order = { Urgent: 0, Perhatian: 1 } as const;
  return anomalies.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 8);
}

export function generateSpendInsights(items: ParsedPurchaseItem[]): SpendInsight[] {
  const insights: SpendInsight[] = [];
  const period = getPeriodLabel(items);
  if (items.length === 0) return insights;

  const grouped = groupBySupplier(items);
  const total = sum(items, "netTotal");

  const consolidation = Object.entries(grouped)
    .filter(([, d]) => d.count >= CONSOLIDATION_MIN_TRANSACTIONS)
    .filter(([, d]) => d.total >= CONSOLIDATION_MIN_TOTAL)
    .sort((a, b) => b[1].count - a[1].count);
  consolidation.slice(0, 3).forEach(([name, d]) => {
    const estimatedSaving = round2(d.total * 0.08);
    insights.push({
      id: `consolidate-${name}`,
      title: `Konsolidasi PO ke ${name}`,
      message: `${name} menerima ${formatNumber(d.count)} transaksi terpisah periode ${period} dengan total ${formatRupiahCompact(d.total)}. Konsolidasi menjadi 1 PO per periode berpotensi diskon volume ~8% (estimasi hemat ${formatRupiahCompact(estimatedSaving)}).`,
      estimatedSaving,
      sourceReportId: "by-supplier",
    });
  });

  const itemSuppliers: Record<string, Set<string>> = {};
  items.forEach((i) => {
    if (!itemSuppliers[i.itemName]) itemSuppliers[i.itemName] = new Set();
    itemSuppliers[i.itemName].add(i.supplierName);
  });
  const multiSupplier = Object.entries(itemSuppliers)
    .filter(([, suppliers]) => suppliers.size >= MULTI_SUPPLIER_MIN)
    .sort((a, b) => b[1].size - a[1].size);
  multiSupplier.slice(0, 3).forEach(([itemName, suppliers]) => {
    const itemTotal = sum(
      items.filter((i) => i.itemName === itemName),
      "netTotal",
    );
    const estimatedSaving = round2(itemTotal * 0.05);
    insights.push({
      id: `single-source-${itemName}`,
      title: `Single-sourcing ${itemName}`,
      message: `${itemName} dibeli dari ${formatNumber(suppliers.size)} supplier berbeda (${[...suppliers].join(", ")}) periode ${period} dengan total ${formatRupiahCompact(itemTotal)}. Menyatu ke satu pemasok utama memperkuat posisi negosiasi (estimasi hemat ~5%: ${formatRupiahCompact(estimatedSaving)}).`,
      estimatedSaving,
      sourceReportId: "ranking",
    });
  });

  const smallPos = items.filter((i) => i.netTotal > 0 && i.netTotal < SMALL_PO_THRESHOLD);
  if (smallPos.length >= SMALL_PO_ALERT) {
    insights.push({
      id: "small-po",
      title: "Banyak transaksi bernilai kecil",
      message: `${formatNumber(smallPos.length)} transaksi (${formatPercent((smallPos.length / items.length) * 100)} dari total) bernilai di bawah ${formatRupiahCompact(SMALL_PO_THRESHOLD)}. Pertimbangkan penggabungan pembelian rutin untuk efisiensi biaya administrasi.`,
      estimatedSaving: 0,
      sourceReportId: "purchase-summary",
    });
  }

  const categoryTotals: Record<string, number> = {};
  items.forEach((i) => {
    categoryTotals[i.itemCategory] = (categoryTotals[i.itemCategory] || 0) + i.netTotal;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && total > 0 && topCategory[1] / total >= CATEGORY_DOMINANCE_THRESHOLD) {
    insights.push({
      id: "category-dominance",
      title: `Kategori ${topCategory[0]} mendominasi belanja`,
      message: `${topCategory[0]} menyumbang ${formatPercent((topCategory[1] / total) * 100)} dari total pembelian periode ${period} (${formatRupiahCompact(topCategory[1])}). Kategori dominan ini kandidat utama negosiasi harga tahunan atau kontrak jangka panjang.`,
      estimatedSaving: 0,
      sourceReportId: "material-cost",
    });
  }

  return insights.sort((a, b) => b.estimatedSaving - a.estimatedSaving);
}

const MONTH_NAMES: [string, number][] = [
  ["januari", 1],
  ["februari", 2],
  ["maret", 3],
  ["april", 4],
  ["mei", 5],
  ["juni", 6],
  ["juli", 7],
  ["agustus", 8],
  ["september", 9],
  ["oktober", 10],
  ["november", 11],
  ["desember", 12],
];

function resolveChatScope(
  question: string,
  items: ParsedPurchaseItem[],
  allItems: ParsedPurchaseItem[],
): { scope: ParsedPurchaseItem[]; note: string } {
  const q = question.toLowerCase();
  const allPhrases = ["semua data", "seluruh data", "semua periode", "seluruh periode", "semua tahun", "seluruh tahun"];
  if (allPhrases.some((p) => q.includes(p))) {
    return { scope: allItems, note: "seluruh data" };
  }
  if (q.includes("bulan ini")) {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return {
      scope: allItems.filter((i) => monthKeyOf(i.purchaseDateObj) === month),
      note: "bulan ini",
    };
  }
  const yearMatch = q.match(/\b(20\d{2})\b/);
  const monthMatch = MONTH_NAMES.find(([name]) => q.includes(name));
  if (monthMatch) {
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear();
    const month = `${year}-${String(monthMatch[1]).padStart(2, "0")}`;
    return {
      scope: allItems.filter((i) => monthKeyOf(i.purchaseDateObj) === month),
      note: `${monthMatch[0]} ${year}`,
    };
  }
  if (q.includes("tahun ini") || q.includes("tahun 2026") || q.includes("sepanjang 2026")) {
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear();
    return {
      scope: allItems.filter((i) => i.purchaseDate?.startsWith(`${year}-`)),
      note: `tahun ${year}`,
    };
  }
  return { scope: items, note: "rentang filter aktif" };
}

function matchItemQuestion(
  question: string,
  scope: ParsedPurchaseItem[],
): ParsedPurchaseItem | null {
  const q = question.toLowerCase();
  const byName: Record<string, ParsedPurchaseItem[]> = {};
  scope.forEach((i) => {
    if (!byName[i.itemName]) byName[i.itemName] = [];
    byName[i.itemName].push(i);
  });
  let best: { name: string; rows: ParsedPurchaseItem[] } | null = null;
  for (const [name, rows] of Object.entries(byName)) {
    const lower = name.toLowerCase();
    const words = lower.split(/\s+/);
    const matched = words.filter((w) => w.length >= 3 && q.includes(w)).length;
    if (
      matched >= Math.min(2, words.length) &&
      (!best || matched > best.name.split(/\s+/).length)
    ) {
      best = { name, rows };
    }
  }
  return best ? best.rows[0] : null;
}

export function answerQuestion(
  question: string,
  items: ParsedPurchaseItem[],
  allItems: ParsedPurchaseItem[],
  purchaseOrders: PurchaseOrder[] = [],
  stockBalances: StockBalance[] = [],
): ChatAnswer {
  const q = question.toLowerCase().trim();
  const { scope, note } = resolveChatScope(question, items, allItems);
  const scopePrefix = `Berdasarkan data ${note}`;

  if (q.length === 0) {
    return { text: "Silakan tulis pertanyaan tentang data purchasing.", sources: [] };
  }

  if (/outstanding po|po outstanding|po sebagian|belum lunas/.test(q)) {
    const rows = purchaseOrders.filter((po) => po.status === "OUTSTANDING");
    if (rows.length === 0) {
      return {
        text: `${scopePrefix}, tidak ada PO berstatus outstanding (penerimaan sebagian) pada dataset.`,
        sources: ["outstanding-po"],
      };
    }
    const list = rows
      .map((po) => `${po.orderNumber} (${po.supplierName})`)
      .join("; ");
    return {
      text: `${scopePrefix}, ${formatNumber(rows.length)} PO berstatus outstanding: ${list}.`,
      sources: ["outstanding-po"],
      followUp: "Ada berapa Open PO?",
    };
  }

  if (/open po|po open|po terbuka|po belum (ada |menerima )?pengiriman|belum dikirim/.test(q)) {
    const rows = purchaseOrders.filter((po) => po.status === "OPEN");
    if (rows.length === 0) {
      return {
        text: `${scopePrefix}, tidak ada Open PO (belum menerima pengiriman) pada dataset.`,
        sources: ["open-po"],
      };
    }
    const list = rows
      .slice(0, 5)
      .map((po) => `${po.orderNumber} (${po.supplierName})`)
      .join("; ");
    return {
      text: `${scopePrefix}, ${formatNumber(rows.length)} Open PO tercatat. Contoh: ${list}.`,
      sources: ["open-po"],
      followUp: "Berapa total nilai Open PO?",
    };
  }

  if (/closed po|po closed|po selesai|po lunas|po ditutup/.test(q)) {
    const rows = purchaseOrders.filter((po) => po.status === "CLOSED");
    const totalValue = rows.reduce((s, po) => s + po.orderNetTotal, 0);
    return {
      text: `${scopePrefix}, ${formatNumber(rows.length)} PO sudah closed (diterima penuh) dengan total nilai ${formatRupiahCompact(totalValue)}.`,
      sources: ["closed-po"],
      followUp: "Berapa total nilai Open PO?",
    };
  }

  if (/total nilai (open|outstanding) po|nilai (open|outstanding) po/.test(q)) {
    const status = q.includes("outstanding") ? "OUTSTANDING" : "OPEN";
    const rows = purchaseOrders.filter((po) => po.status === status);
    const totalValue = rows.reduce((s, po) => s + po.orderNetTotal, 0);
    return {
      text: `${scopePrefix}, total nilai ${status === "OPEN" ? "Open" : "Outstanding"} PO mencapai ${formatRupiahCompact(totalValue)} dari ${formatNumber(rows.length)} PO.`,
      sources: status === "OPEN" ? ["open-po"] : ["outstanding-po"],
      followUp: "Supplier mana yang paling sering telat kirim?",
    };
  }

  if (/stok|saldo|on ?hand/.test(q) && /gudang|warehouse|keseluruhan|semua|total/.test(q)) {
    if (stockBalances.length === 0) {
      return { text: `${scopePrefix}, tidak ada data saldo stok.`, sources: [] };
    }
    const totalOnHand = stockBalances.reduce((s, r) => s + r.onHand, 0);
    const totalValue = stockBalances.reduce(
      (s, r) => s + r.onHand * r.lastPurchaseCost,
      0,
    );
    const warehouses = new Set(
      stockBalances.map((s) => s.warehouseName).filter(Boolean),
    ).size;
    return {
      text: `${scopePrefix}, total saldo stok ${formatNumber(round2(totalOnHand))} unit dari ${formatNumber(stockBalances.length)} baris item di ${formatNumber(warehouses)} gudang, dengan nilai stok ${formatRupiahCompact(totalValue)}.`,
      sources: [],
      followUp: "Berapa total pembelian periode ini?",
    };
  }

  const categoryWords =
    /kategori|bahan baku|bahan pendukung|sparepart|barang dagang|wip/.test(q);
  const itemMatch = categoryWords
    ? null
    : matchItemQuestion(q, scope);
  if (itemMatch && /item|harga|beli|pembelian|berapa|total|mahal|murah|naik|turun/.test(q)) {
    const rows = scope.filter((i) => i.itemName === itemMatch.itemName);
    const total = sum(rows, "netTotal");
    const maxRow = rows.filter((r) => r.unitCost > 0).sort((a, b) => b.unitCost - a.unitCost)[0];
    let text = `${scopePrefix}: ${itemMatch.itemName} dibeli ${formatNumber(rows.length)}x senilai ${formatRupiahCompact(total)}`;
    if (maxRow) {
      text += `, harga satuan terakhir ${formatRupiahCompact(maxRow.unitCost)}/${maxRow.uom} dari ${maxRow.supplierName}`;
    }
    text += ".";
    return { text, sources: ["price-history"], followUp: "Item apa yang harganya naik paling tinggi?" };
  }

  if (/telat|terlambat|keterlambatan|delay|overdue/.test(q)) {
    const grouped = groupBySupplier(scope);
    const overdueRows = Object.entries(grouped)
      .filter(([, d]) => d.overdueCount > 0)
      .sort((a, b) => b[1].overdueCount - a[1].overdueCount)
      .slice(0, 5);
    if (overdueRows.length === 0) {
      return {
        text: `${scopePrefix}, tidak ada transaksi yang tercatat terlambat (PO→invoice melewati batas).`,
        sources: ["delivery"],
      };
    }
    const totalOverdue = overdueRows.reduce((a, [, d]) => a + d.overdueCount, 0);
    const list = overdueRows
      .map(([name, d]) => `${name} (${formatNumber(d.overdueCount)}x, rata-rata ${round1(avg(d.overdueDays))} hari)`)
      .join("; ");
    return {
      text: `${scopePrefix}, tercatat ${formatNumber(totalOverdue)} keterlambatan. Urutan supplier paling sering telat: ${list}.`,
      sources: ["delivery"],
      followUp: "Berapa rata-rata lead time PO?",
    };
  }

  if (/top|terbesar|peringkat|terbanyak|teratas/.test(q) && /supplier|pemasok|vendor/.test(q)) {
    const grouped = groupBySupplier(scope);
    const sorted = Object.entries(grouped).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
    const total = sum(scope, "netTotal");
    const list = sorted
      .map(([name, d], idx) => `${idx + 1}. ${name} ${formatRupiahCompact(d.total)} (${total > 0 ? formatPercent((d.total / total) * 100) : "0,0%"})`)
      .join("; ");
    return {
      text: `${scopePrefix}, 5 supplier terbesar berdasarkan nilai pembelian: ${list}.`,
      sources: ["ranking", "by-supplier"],
      followUp: "Supplier mana yang paling sering telat kirim?",
    };
  }

  if (/berapa (jumlah )?(supplier|pemasok)|jumlah supplier|supplier (aktif )?berapa/.test(q)) {
    const grouped = groupBySupplier(scope);
    const names = Object.keys(grouped).sort((a, b) => grouped[b].total - grouped[a].total);
    const top3 = names.slice(0, 3).join(", ");
    return {
      text: `${scopePrefix}, ada ${formatNumber(names.length)} supplier aktif. Tiga terbesar: ${top3}.`,
      sources: ["by-supplier"],
      followUp: "Top 5 supplier terbesar?",
    };
  }

  if (/termahal|harga tertinggi|paling mahal|mahal/.test(q)) {
    const rows = scope.filter((i) => i.unitCost > 0);
    if (rows.length === 0) {
      return { text: `${scopePrefix}, tidak ada data harga satuan.`, sources: ["price-history"] };
    }
    const max = rows.sort((a, b) => b.unitCost - a.unitCost)[0];
    return {
      text: `${scopePrefix}, item dengan harga satuan tertinggi: ${max.itemName} ${formatRupiahCompact(max.unitCost)}/${max.uom} (${max.supplierName}).`,
      sources: ["price-history"],
      followUp: "Total pembelian per kategori?",
    };
  }

  if (/lead ?time|lama (waktu )?(pengiriman|proses)|berapa hari/.test(q)) {
    const rows = scope.filter((i) => i.prPiDays > 0 || i.poPiDays > 0);
    if (rows.length === 0) {
      return { text: `${scopePrefix}, tidak ada data durasi lead time.`, sources: ["lead-time"] };
    }
    const avgPr = round1(avg(rows.map((r) => r.prPiDays).filter((d) => d > 0)));
    const avgPo = round1(avg(rows.map((r) => r.poPiDays).filter((d) => d > 0)));
    return {
      text: `${scopePrefix}, rata-rata lead time PR→invoice ${avgPr} hari dan PO→invoice ${avgPo} hari dari ${formatNumber(rows.length)} transaksi.`,
      sources: ["lead-time"],
      followUp: "Supplier mana yang paling sering telat kirim?",
    };
  }

  if (/naik|kenaikan|melonjak|alert/.test(q) && /harga|item|barang/.test(q)) {
    const alerts = priceIncreaseAlerts(scope);
    if (alerts.length === 0) {
      return {
        text: `${scopePrefix}, tidak ada kenaikan harga berurutan ≥ 10% yang terdeteksi.`,
        sources: ["price-alert"],
      };
    }
    const top3 = alerts.slice(0, 3)
      .map((a) => `${a.item} +${formatPercent(a.increase * 100)} (${formatRupiahCompact(a.prev)} → ${formatRupiahCompact(a.curr)})`)
      .join("; ");
    return {
      text: `${scopePrefix}, ${formatNumber(alerts.length)} kenaikan harga ≥ 10% terdeteksi. Terbesar: ${top3}.`,
      sources: ["price-alert"],
      followUp: "Berapa total pembelian periode ini?",
    };
  }

  if (/variance|selisih|kurang (kirim|terima)|tidak sesuai|shortage/.test(q)) {
    const rows = getVarianceRows(scope);
    if (rows.length === 0) {
      return {
        text: `${scopePrefix}, semua transaksi sesuai dengan qty yang dipesan — tidak ada selisih.`,
        sources: ["variance"],
      };
    }
    const neg = rows.filter((r) => r.variance < 0);
    const totalDiff = round2(rows.reduce((a, r) => a + r.variance, 0));
    return {
      text: `${scopePrefix}, ${formatNumber(rows.length)} transaksi memiliki selisih qty (${formatNumber(neg.length)} kurang dari pesanan, total selisih ${formatNumber(totalDiff)} unit).`,
      sources: ["variance"],
      followUp: "Berapa rata-rata lead time PO?",
    };
  }

  if (/kategori/.test(q)) {
    const totals: Record<string, number> = {};
    scope.forEach((i) => {
      totals[i.itemCategory] = (totals[i.itemCategory] || 0) + i.netTotal;
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const list = sorted
      .map(([name, val]) => `${name}: ${formatRupiahCompact(val)}`)
      .join("; ");
    return {
      text: `${scopePrefix}, total pembelian per kategori: ${list}.`,
      sources: ["material-cost", "purchase-summary"],
      followUp: "Item apa yang harganya naik paling tinggi?",
    };
  }

  const categoryMatch = /bahan baku|bahan pendukung|sparepart|wip|barang dagang/.exec(q);
  if (categoryMatch) {
    const category = categoryMatch[0] === "wip" ? "WORK IN PROGRESS" : categoryMatch[0].toUpperCase();
    const rows = scope.filter((i) => i.itemCategory === category);
    if (rows.length === 0) {
      return { text: `${scopePrefix}, tidak ada transaksi kategori ${categoryMatch[0]}.`, sources: ["material-cost"] };
    }
    return {
      text: `${scopePrefix}, kategori ${categoryMatch[0]}: ${formatNumber(rows.length)} transaksi senilai ${formatRupiahCompact(sum(rows, "netTotal"))}.`,
      sources: ["material-cost"],
      followUp: "Item apa yang harganya naik paling tinggi?",
    };
  }

  if (/gudang|warehouse/.test(q)) {
    const totals: Record<string, number> = {};
    scope.forEach((i) => {
      totals[i.warehouse] = (totals[i.warehouse] || 0) + i.netTotal;
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const list = sorted.map(([name, val]) => `${name || "-"}: ${formatRupiahCompact(val)}`).join("; ");
    return {
      text: `${scopePrefix}, gudang dengan pembelian terbesar: ${list}.`,
      sources: ["purchase-summary"],
      followUp: "Top 5 supplier terbesar?",
    };
  }

  if (/skor|scorecard|rating|perform(a|e) supplier/.test(q)) {
    const rows = computeSupplierScores(scope);
    if (rows.length === 0) {
      return { text: `${scopePrefix}, tidak ada data supplier.`, sources: ["scorecard"] };
    }
    const list = rows
      .slice(0, 5)
      .map((r) => `${r.supplierName} (${r.totalScore}, ${r.rating})`)
      .join("; ");
    return {
      text: `${scopePrefix}, peringkat skor supplier: ${list}.`,
      sources: ["scorecard"],
      followUp: "Supplier mana yang paling sering telat kirim?",
    };
  }

  if (/hemat|konsolidasi|efisiensi|diskon|penghematan/.test(q)) {
    const insights = generateSpendInsights(scope);
    if (insights.length === 0) {
      return { text: `${scopePrefix}, belum ada peluang penghematan signifikan yang terdeteksi.`, sources: [] };
    }
    const list = insights
      .slice(0, 3)
      .map((i) => `${i.title} (${formatRupiahCompact(i.estimatedSaving)})`)
      .join("; ");
    return {
      text: `${scopePrefix}, peluang penghematan yang terdeteksi: ${list}. Detail lengkap ada di section Analisis Pengeluaran halaman ini.`,
      sources: ["by-supplier", "ranking"],
      followUp: "Berapa total pembelian periode ini?",
    };
  }

  if (/total|berapa|pembelian|belanja|spend|nilai/.test(q)) {
    const total = sum(scope, "netTotal");
    const count = scope.length;
    return {
      text: `${scopePrefix}, total pembelian mencapai ${formatRupiahCompact(total)} dari ${formatNumber(count)} transaksi.`,
      sources: ["purchase-summary"],
      followUp: "Total pembelian per kategori?",
    };
  }

  return {
    text: `Saya belum bisa menjawab pertanyaan itu. Coba tanyakan, misalnya: "supplier mana yang paling sering telat?", "berapa total pembelian?", "item apa yang harganya naik?", "top 5 supplier terbesar?", "berapa rata-rata lead time?", atau "total pembelian per kategori?". Jawaban dihitung dari data asli ${note}.`,
    sources: [],
    followUp: "Berapa total pembelian periode ini?",
  };
}

export const CHAT_SUGGESTIONS = [
  "Supplier mana yang paling sering telat kirim?",
  "Berapa total pembelian periode ini?",
  "Item apa yang harganya naik paling tinggi?",
  "Top 5 supplier terbesar?",
  "Berapa rata-rata lead time PO?",
  "Total pembelian per kategori?",
  "Ada berapa Open PO?",
  "Berapa total saldo stok di semua gudang?",
];