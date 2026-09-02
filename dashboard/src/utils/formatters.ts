import type {
  PurchaseItem,
  ParsedPurchaseItem,
  PurchaseOrderRecord,
  ParsedPurchaseOrder,
  StockRecord,
  ParsedStockRecord,
  TransferRecord,
  ParsedTransfer,
  AdjustmentRecord,
  ParsedAdjustment,
  UsageRecord,
  ParsedUsage,
  ProductionRecord,
  ParsedProduction,
  ProductionMaterialRecord,
  ParsedProductionMaterial,
  ProductionOutputRecord,
  ParsedProductionOutput,
} from "../types/purchase";
import { format, parseISO, isValid } from "date-fns";
import { id } from "date-fns/locale";

const parseNum = (val: string | undefined | null): number => {
  if (val === "" || val === null || val === undefined) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export function parsePurchaseItem(item: PurchaseItem): ParsedPurchaseItem {
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

export function monthLabelOf(date: Date | null | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "MMM yyyy", { locale: id });
}

export function byPurchaseDateAsc(
  a: { purchaseDateObj: Date | null },
  b: { purchaseDateObj: Date | null },
): number {
  return (a.purchaseDateObj?.getTime() ?? 0) - (b.purchaseDateObj?.getTime() ?? 0);
}

export function parseStockItem(item: StockRecord): ParsedStockRecord {
  return {
    ...item,
    onHand: parseNum(item.onHand),
    outstandingPO: parseNum(item.outstandingPO),
    outstandingSO: parseNum(item.outstandingSO),
    qtyInTransit: parseNum(item.qtyInTransit),
    qtyBlocked: parseNum(item.qtyBlocked),
    qtyMinimumOrder: parseNum(item.qtyMinimumOrder),
    lastPurchaseCost: parseNum(item.lastPurchaseCost),
    lastPurchaseQuantity: parseNum(item.lastPurchaseQuantity),
    daysSinceLastUsage: parseNum(item.daysSinceLastUsage),
    age: parseNum(item.age),
    dateObj: null,
  };
}

export function parseAllStock(items: StockRecord[]): ParsedStockRecord[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "stock")
    .map((item) => {
      const parsed = parseStockItem(item);
      parsed.dateObj = parseDateCached(dateCache, item.date);
      return parsed;
    });
}

export function parseTransferItem(item: TransferRecord): ParsedTransfer {
  return {
    ...item,
    quantity: parseNum(item.quantity),
    receivedQuantity: parseNum(item.receivedQuantity),
    unitPrice: parseNum(item.unitPrice),
    lineTotal: parseNum(item.lineTotal),
    transferDateObj: null,
    receivedDateObj: null,
  };
}

export function parseAllTransfers(items: TransferRecord[]): ParsedTransfer[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "transfer")
    .map((item) => {
      const parsed = parseTransferItem(item);
      parsed.transferDateObj = parseDateCached(dateCache, item.transferDate);
      parsed.receivedDateObj = parseDateCached(dateCache, item.receivedDate);
      return parsed;
    });
}

export function parseAdjustmentItem(item: AdjustmentRecord): ParsedAdjustment {
  return {
    ...item,
    quantity: parseNum(item.quantity),
    quantityCR: parseNum(item.quantityCR),
    quantityDB: parseNum(item.quantityDB),
    adjustedValue: parseNum(item.adjustedValue),
    adjustedValuePerUnit: parseNum(item.adjustedValuePerUnit),
    adjustmentDateObj: null,
  };
}

export function parseAllAdjustments(items: AdjustmentRecord[]): ParsedAdjustment[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "adjustment")
    .map((item) => {
      const parsed = parseAdjustmentItem(item);
      parsed.adjustmentDateObj = parseDateCached(dateCache, item.adjustmentDate);
      return parsed;
    });
}

export function parseUsageItem(item: UsageRecord): ParsedUsage {
  return {
    ...item,
    quantity: parseNum(item.quantity),
    quantityReturned: parseNum(item.quantityReturned),
    qtyReturned: parseNum(item.qtyReturned),
    totalCost: parseNum(item.totalCost),
    cost: parseNum(item.cost),
    usageDateObj: null,
  };
}

export function parseAllUsages(items: UsageRecord[]): ParsedUsage[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "usage")
    .map((item) => {
      const parsed = parseUsageItem(item);
      parsed.usageDateObj = parseDateCached(dateCache, item.usageDate);
      return parsed;
    });
}

export function parseProductionItem(item: ProductionRecord): ParsedProduction {
  return {
    ...item,
    productionHour: parseNum(item.productionHour),
    quantity: parseNum(item.quantity),
    cog: parseNum(item.cog),
    totalCog: parseNum(item.totalCog),
    productionDateObj: null,
  };
}

export function parseAllProductions(items: ProductionRecord[]): ParsedProduction[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "production")
    .map((item) => {
      const parsed = parseProductionItem(item);
      parsed.productionDateObj = parseDateCached(dateCache, item.productionDate);
      return parsed;
    });
}

export function parseProductionMaterialItem(
  item: ProductionMaterialRecord,
): ParsedProductionMaterial {
  return {
    ...item,
    productionHour: parseNum(item.productionHour),
    quantity: parseNum(item.quantity),
    estQuantity: parseNum(item.estQuantity),
    cog: parseNum(item.cog),
    totalCog: parseNum(item.totalCog),
    productionDateObj: null,
  };
}

export function parseAllProductionMaterials(
  items: ProductionMaterialRecord[],
): ParsedProductionMaterial[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "productionMaterial")
    .map((item) => {
      const parsed = parseProductionMaterialItem(item);
      parsed.productionDateObj = parseDateCached(dateCache, item.productionDate);
      return parsed;
    });
}

export function parseProductionOutputItem(
  item: ProductionOutputRecord,
): ParsedProductionOutput {
  return {
    ...item,
    productionHour: parseNum(item.productionHour),
    quantity: parseNum(item.quantity),
    originalQuantity: parseNum(item.originalQuantity),
    costOfGood: parseNum(item.costOfGood),
    totalCostOfGood: parseNum(item.totalCostOfGood),
    totalWaste: parseNum(item.totalWaste),
    productionDateObj: null,
  };
}

export function parseAllProductionOutputs(
  items: ProductionOutputRecord[],
): ParsedProductionOutput[] {
  const dateCache = new Map<string, Date | null>();
  return items
    .filter((item) => item.recordType === "productionOutput")
    .map((item) => {
      const parsed = parseProductionOutputItem(item);
      parsed.productionDateObj = parseDateCached(dateCache, item.productionDate);
      return parsed;
    });
}

export function filterByDateAccessor<T>(
  items: T[],
  startDate: Date | null,
  endDate: Date | null,
  getDate: (item: T) => Date | null,
): T[] {
  if (!startDate && !endDate) return items;
  return items.filter((item) => {
    const date = getDate(item);
    if (!date) return false;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  });
}

export function warehouseFull(code: string, name: string): string {
  const n = name?.trim();
  if (!n) return warehouseLabel(code);
  return /^[0-9]+:/.test(n) ? n : `${code}: ${n}`;
}
