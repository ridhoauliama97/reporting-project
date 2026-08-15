import type { PurchaseItem, ParsedPurchaseItem } from '../types/purchase';
import { format, parseISO, isValid } from 'date-fns';
import { id } from 'date-fns/locale';

export function parsePurchaseItem(item: PurchaseItem): ParsedPurchaseItem {
  const parseNum = (val: string): number => {
    if (val === '' || val === null || val === undefined) return 0;
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
  };
}

export function parseAllItems(items: PurchaseItem[]): ParsedPurchaseItem[] {
  return items.map(parsePurchaseItem);
}

export function formatRupiah(value: number): string {
  if (value === 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === '') return '-';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '-';
    return format(date, 'dd MMM yyyy', { locale: id });
  } catch {
    return '-';
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr || dateStr === '') return '-';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '-';
    return format(date, 'dd/MM/yyyy');
  } catch {
    return '-';
  }
}

export function filterByDateRange(
  items: ParsedPurchaseItem[],
  startDate: Date | null,
  endDate: Date | null,
  dateField: 'purchaseDate' | 'poDate' | 'prDate' = 'purchaseDate'
): ParsedPurchaseItem[] {
  if (!startDate && !endDate) return items;

  return items.filter((item) => {
    const dateStr = item[dateField];
    if (!dateStr) return false;
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return false;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return true;
    } catch {
      return false;
    }
  });
}

export function getMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return format(date, 'yyyy-MM');
  } catch {
    return '';
  }
}

export function getMonthLabel(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return format(date, 'MMM yyyy', { locale: id });
  } catch {
    return '';
  }
}