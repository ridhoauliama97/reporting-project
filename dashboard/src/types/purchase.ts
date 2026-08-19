export interface PurchaseItem {
  recordType: string;
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

export interface PurchaseOrderRecord {
  recordType: string;
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  importance: string;
  terms: string;
  incoterm: string;
  deliveryDays: string;
  poPiDays: string;
  supplierCode: string;
  supplierName: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  qtyOrdered: string;
  qtyDelivered: string;
  qtyOutstanding: string;
  pctDelivered: string;
  itemUnitCost: string;
  orderNetTotal: string;
  prNumber: string;
  prDate: string;
  requestedBy: string;
  usedBy: string;
  targetWarehouse: string;
  purchaseInvoice: string;
  lastPurchaseNumber: string;
  createdBy: string;
  approvedBy: string;
}

export interface ParsedPurchaseOrder
  extends Omit<PurchaseOrderRecord, 'deliveryDays' | 'poPiDays' | 'qtyOrdered' | 'qtyDelivered' | 'qtyOutstanding' | 'pctDelivered' | 'itemUnitCost' | 'orderNetTotal'> {
  deliveryDays: number;
  poPiDays: number;
  qtyOrdered: number;
  qtyDelivered: number;
  qtyOutstanding: number;
  pctDelivered: number;
  itemUnitCost: number;
  orderNetTotal: number;
  orderDateObj: Date | null;
  expectedDateObj: Date | null;
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