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

export interface StockRecord {
  recordType: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  itemType: string;
  uom: string;
  warehouseCode: string;
  warehouseName: string;
  onHand: string;
  outstandingPO: string;
  outstandingSO: string;
  qtyInTransit: string;
  qtyBlocked: string;
  qtyMinimumOrder: string;
  lastPurchaseDate: string;
  lastPurchaseCost: string;
  lastPurchaseQuantity: string;
  lastPurchaseNumber: string;
  lastSupplierCode: string;
  lastSupplierName: string;
  lastUsageDate: string;
  daysSinceLastUsage: string;
  age: string;
  discontinued: string;
  shelfCode: string;
  status: string;
  date: string;
}

export interface ParsedStockRecord
  extends Omit<
    StockRecord,
    | 'onHand'
    | 'outstandingPO'
    | 'outstandingSO'
    | 'qtyInTransit'
    | 'qtyBlocked'
    | 'qtyMinimumOrder'
    | 'lastPurchaseCost'
    | 'lastPurchaseQuantity'
    | 'daysSinceLastUsage'
    | 'age'
  > {
  onHand: number;
  outstandingPO: number;
  outstandingSO: number;
  qtyInTransit: number;
  qtyBlocked: number;
  qtyMinimumOrder: number;
  lastPurchaseCost: number;
  lastPurchaseQuantity: number;
  daysSinceLastUsage: number;
  age: number;
  dateObj: Date | null;
}

export interface TransferRecord {
  recordType: string;
  memoNumber: string;
  transferDate: string;
  receivedDate: string;
  received: string;
  void: string;
  goodsTransferType: string;
  originWarehouseCode: string;
  originWarehouseName: string;
  destinationWarehouseCode: string;
  destinationWarehouseName: string;
  transitWarehouseCode: string;
  transitWarehouseName: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: string;
  receivedQuantity: string;
  unitPrice: string;
  lineTotal: string;
  purpose: string;
  createdBy: string;
}

export interface ParsedTransfer
  extends Omit<TransferRecord, 'quantity' | 'receivedQuantity' | 'unitPrice' | 'lineTotal'> {
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  lineTotal: number;
  transferDateObj: Date | null;
  receivedDateObj: Date | null;
}

export interface AdjustmentRecord {
  recordType: string;
  memoNumber: string;
  adjustmentDate: string;
  adjustmentType: string;
  status: string;
  postAs: string;
  approvedBy: string;
  createdBy: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: string;
  quantityCR: string;
  quantityDB: string;
  adjustedValue: string;
  adjustedValuePerUnit: string;
  warehouseCode: string;
  warehouseName: string;
  memoRemarks: string;
}

export interface ParsedAdjustment
  extends Omit<
    AdjustmentRecord,
    'quantity' | 'quantityCR' | 'quantityDB' | 'adjustedValue' | 'adjustedValuePerUnit'
  > {
  quantity: number;
  quantityCR: number;
  quantityDB: number;
  adjustedValue: number;
  adjustedValuePerUnit: number;
  adjustmentDateObj: Date | null;
}

export interface UsageRecord {
  recordType: string;
  usageNumber: string;
  usageDate: string;
  effectiveDate: string;
  usageType: string;
  purpose: string;
  requestedBy: string;
  requestedByName: string;
  usedByCode: string;
  usedByName: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: string;
  quantityReturned: string;
  qtyReturned: string;
  totalCost: string;
  cost: string;
  warehouseCode: string;
  warehouseName: string;
  employeeRelation: string;
  brokenNotReturnedReason: string;
  memoRemarks: string;
  createdBy: string;
}

export interface ParsedUsage
  extends Omit<
    UsageRecord,
    'quantity' | 'quantityReturned' | 'qtyReturned' | 'totalCost' | 'cost'
  > {
  quantity: number;
  quantityReturned: number;
  qtyReturned: number;
  totalCost: number;
  cost: number;
  usageDateObj: Date | null;
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