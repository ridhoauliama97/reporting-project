import type { PurchaseItem, ParsedPurchaseItem, PurchaseOrderRecord, ParsedPurchaseOrder } from "../types/purchase";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

export function parsePurchaseItem(item: PurchaseItem): ParsedPurchaseItem {
  const parseNum = (val: string): number => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  return {
    ...item,
    qtyOrdered: parseNum(item.qtyOrdered),
    quantity: parseNum(item.quantity),
    unitCost: parseNum(item.unitCost),
    poUnitCost: parseNum(item.poUnitCost),
    netTotal: parseNum(item.netTotal),
    poPiDays: parseNum(item.poPiDays),
    prPiDays: parseNum(item.prPiDays),
    poPiOverdueDays: parseNum(item.poPiOverdueDays),
    purchaseDateObj: null,
    poDateObj: null,
    prDateObj: null,
  };
}

function parseDateCached(
  cache: Map<string, Date | null>,
  dateStr: string,
): Date | null {
  if (!dateStr) return null;
  const cached = cache.get(dateStr);
  if (cached !== undefined) return cached;
  try {
    const date = parseISO(dateStr);
    cache.set(dateStr, isValid(date) ? date : null);
  } catch {
    cache.set(dateStr, null);
  }
  return cache.get(dateStr) ?? null;
}

export function parseAllItems(items: PurchaseItem[]): ParsedPurchaseItem[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "purchase")
    .map((item) => {
      const parsed = parsePurchaseItem(item);
      parsed.purchaseDateObj = parseDateCached(dateCache, item.purchaseDate);
      parsed.poDateObj = parseDateCached(dateCache, item.poDate);
      parsed.prDateObj = parseDateCached(dateCache, item.prDate);
      return parsed;
    });
}

export function parsePurchaseOrder(item: PurchaseOrderRecord): ParsedPurchaseOrder {
  const parseNum = (val: string): number => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  return {
    ...item,
    deliveryDays: parseNum(item.deliveryDays),
    poPiDays: parseNum(item.poPiDays),
    qtyOrdered: parseNum(item.qtyOrdered),
    qtyDelivered: parseNum(item.qtyDelivered),
    qtyOutstanding: parseNum(item.qtyOutstanding),
    pctDelivered: parseNum(item.pctDelivered),
    itemUnitCost: parseNum(item.itemUnitCost),
    orderNetTotal: parseNum(item.orderNetTotal),
    orderDateObj: null,
    expectedDateObj: null,
  };
}

export function parseAllPurchaseOrders(items: PurchaseOrderRecord[]): ParsedPurchaseOrder[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "po")
    .map((item) => {
      const parsed = parsePurchaseOrder(item);
      parsed.orderDateObj = parseDateCached(dateCache, item.orderDate);
      parsed.expectedDateObj = parseDateCached(dateCache, item.expectedDeliveryDate);
      return parsed;
    });
}

export function filterPurchaseOrdersByDateRange(
  items: ParsedPurchaseOrder[],
  startDate: Date | null,
  endDate: Date | null,
): ParsedPurchaseOrder[] {
  if (!startDate && !endDate) return items;
  return items.filter((item) => {
    const date = item.orderDateObj;
    if (!date) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

const compactNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

export function formatRupiah(value: number): string {
  if (value === 0) return "-";
  return rupiahFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRupiahCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e12)
    return `Rp ${compactNumberFormatter.format(value / 1e12)} Triliun`;
  if (abs >= 1e9)
    return `Rp ${compactNumberFormatter.format(value / 1e9)} Miliar`;
  if (abs >= 1e6)
    return `Rp ${compactNumberFormatter.format(value / 1e6)} Juta`;
  if (abs >= 1e3)
    return `Rp ${compactNumberFormatter.format(value / 1e3)} Ribu`;
  return formatRupiah(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const round1 = (n: number): number => Math.round(n * 10) / 10;

export const round2 = (n: number): number => Math.round(n * 100) / 100;

const WAREHOUSE_LABELS: Record<string, string> = {
  "01": "01: GUDANG BAHAN BAKU",
  "04": "04: GUDANG BARANG JADI",
  "07": "07: GUDANG SPAREPART",
  "09": "09: CBD SPAREPART",
  "51": "51: GUDANG WIP",
  "54": "54: GUDANG PEKANBARU",
  "24": "24: KANTOR SALES",
};

export function warehouseLabel(code: string): string {
  if (!code || code === "") return "-";
  return WAREHOUSE_LABELS[code] ?? code;
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "") return "-";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "-";
    return format(date, "dd MMM yyyy", { locale: id });
  } catch {
    return "-";
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr || dateStr === "") return "-";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "-";
    return format(date, "dd/MM/yyyy");
  } catch {
    return "-";
  }
}

export function filterByDateRange(
  items: ParsedPurchaseItem[],
  startDate: Date | null,
  endDate: Date | null,
  dateField: "purchaseDate" | "poDate" | "prDate" = "purchaseDate",
): ParsedPurchaseItem[] {
  if (!startDate && !endDate) return items;

  const dateObjField =
    dateField === "poDate"
      ? "poDateObj"
      : dateField === "prDate"
        ? "prDateObj"
        : "purchaseDateObj";

  return items.filter((item) => {
    const date = item[dateObjField];
    if (!date) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });
}

export function getMonthYear(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "";
    return format(date, "yyyy-MM");
  } catch {
    return "";
  }
}

export function getMonthLabel(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "";
    return format(date, "MMM yyyy", { locale: id });
  } catch {
    return "";
  }
}

export function monthKeyOf(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM");
}

export function byPurchaseDateAsc(
  a: { purchaseDateObj: Date | null },
  b: { purchaseDateObj: Date | null },
): number {
  return (a.purchaseDateObj?.getTime() ?? 0) - (b.purchaseDateObj?.getTime() ?? 0);
}
