export interface PurchaseItem {
  purchaseNumber: string;
  purchaseType: string;
  purchaseDate: string;
  dueDate: string;
  prNumber: string;
  prDate: string;
  poNumber: string;
  poDate: string;
  poExpectedDate: string;
  poPiDays: string;
  prPiDays: string;
  poPiOverdueDays: string;
  referenceNumber: string;
  transitStatus: string;
  supplierCode: string;
  supplierName: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  itemType: string;
  uom: string;
  warehouse: string;
  qtyOrdered: string;
  quantity: string;
  unitCost: string;
  poUnitCost: string;
  netTotal: string;
  requestedBy: string;
  usedBy: string;
  poCreator: string;
  poApprovedBy: string;
}

export interface ParsedPurchaseItem extends Omit<PurchaseItem, 'qtyOrdered' | 'quantity' | 'unitCost' | 'poUnitCost' | 'netTotal' | 'poPiDays' | 'prPiDays' | 'poPiOverdueDays'> {
  qtyOrdered: number;
  quantity: number;
  unitCost: number;
  poUnitCost: number;
  netTotal: number;
  poPiDays: number;
  prPiDays: number;
  poPiOverdueDays: number;
  purchaseDateObj: Date | null;
  poDateObj: Date | null;
  prDateObj: Date | null;
}

export type ItemCategory = 'BAHAN BAKU' | 'BAHAN PENDUKUNG' | 'SPAREPART' | 'WORK IN PROGRESS' | 'BARANG DAGANG';

export const ITEM_CATEGORIES: ItemCategory[] = [
  'BAHAN BAKU',
  'BAHAN PENDUKUNG',
  'SPAREPART',
  'WORK IN PROGRESS',
  'BARANG DAGANG'
];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  'BAHAN BAKU': 'Bahan Baku',
  'BAHAN PENDUKUNG': 'Bahan Pendukung',
  'SPAREPART': 'Sparepart',
  'WORK IN PROGRESS': 'WIP',
  'BARANG DAGANG': 'Barang Dagang'
};