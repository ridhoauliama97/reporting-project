export interface RawPurchaseItem {
  purchaseDetailId: string;
  itemId: string;
  purchaseNumber: string;
  purchaseType: string;
  purchaseDate: string;
  dueDate: string;
  prNumber: string;
  prDate: string;
  poNumber: string;
  poDate: string;
  poExpectedDate: string;
  poPiDays: number;
  prPiDays: number;
  prPoDays: number;
  requiredPrDays: number;
  prRequiredDate: string;
  poPiOverdueDays: number;
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
  qtyOrdered: number;
  quantity: number;
  unitCost: number;
  poUnitCost: number;
  netTotal: number;
  lineTotal: number;
  lineTotalAfterTax: number;
  qtyUsed: number;
  qtyTransferred: number;
  quantityReceived: number;
  amountReceived: number;
  qcBy: string;
  qcComment: string;
  requestedBy: string;
  usedBy: string;
  purpose: string;
  poCreator: string;
  poApprovedBy: string;
  currency: string;
  paymentTerm: number;
  priceGroup: string;
  itemFamilyCode: string;
  itemFamilyName: string;
  itemSpecification: string;
  itemPartNumber: string;
  supplierCity: string;
}

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
  prPoDays: number;
  requiredPrDays: number;
  prRequiredDate: string;
  lineTotal: number;
  lineTotalAfterTax: number;
  qtyUsed: number;
  qtyTransferred: number;
  quantityReceived: number;
  amountReceived: number;
  qcBy: string;
  qcComment: string;
  purpose: string;
  purchaseDetailId: string;
  itemId: string;
  purchaseDateObj: Date | null;
  poDateObj: Date | null;
  prDateObj: Date | null;
}

export type PoLineStatus = "OPEN" | "OUTSTANDING" | "CLOSED";

export interface PurchaseOrderLine {
  lineStatus: PoLineStatus;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  qtyOrdered: number;
  qtyDelivered: number;
  qtyOutstanding: number;
  itemPercentDelivered: number;
  itemUnitCost: number;
  lineTotal: number;
  prNumber: string;
  prDate: string;
}

export interface PurchaseOrder {
  orderNumber: string;
  status: PoLineStatus;
  poType: string;
  orderDate: string;
  expectedDeliveryDate: string;
  importance: string;
  approved: string;
  approvedBy: string;
  approvedDate: string;
  supplierCode: string;
  supplierName: string;
  targetWarehouse: string;
  orderNetTotal: number;
  purchaseOrderPercentDelivered: number;
  deliveryDays: number;
  poPiDays: number;
  prNumber: string;
  prDate: string;
  prRequiredDate: string;
  closedBy: string;
  closedReason: string;
  usedBy: string;
  requestedBy: string;
  lines: PurchaseOrderLine[];
}

export interface PurchaseRequestItem {
  prType: string;
  prNumber: string;
  prDate: string;
  requiredDate: string;
  importance: string;
  status: string;
  approved: string;
  approvedBy: string;
  approvedDate: string;
  requestedBy: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  qtyRequested: number;
  qtyShipped: number;
  qtyOnOrder: number;
  qtyOnHand: number;
  poNumber: string;
  poDate: string;
  supplierCode: string;
  supplierName: string;
  itemRemarks: string;
}

export interface UsageItem {
  itemId: string;
  usageDetailId: string;
  usageType: string;
  usageNumber: string;
  usageDate: string;
  effectiveDate: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: number;
  cost: number;
  totalCost: number;
  warehouse: string;
  warehouseCode: string;
  warehouseName: string;
  requestedBy: string;
  requestedByCode: string;
  requestedByDepartment: string;
  purpose: string;
  costCenterSegment1Name: string;
  itemRemarks: string;
}

export interface StockBalance {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  onHand: number;
  smallestOnHand: number;
  outstandingSO: number;
  qtyInTransit: number;
  qtyBlocked: number;
  grade: string;
  discontinued: string;
  lastPurchaseDate: string;
  lastPurchaseCost: number;
  lastPurchaseNumber: string;
  lastPurchaseQuantity: number;
  lastSupplierCode: string;
  lastSupplierName: string;
  priceGroup: string;
  priceGroupCategory: string;
  shelfCode: string;
}

export interface GoodsTransfer {
  transferType: string;
  memoNumber: string;
  transferDate: string;
  receivedDate: string;
  received: string;
  receivedBy: string;
  originWarehouse: string;
  originWarehouseCode: string;
  destinationWarehouse: string;
  destinationWarehouseCode: string;
  driverName: string;
  vehicleNo: string;
  purpose: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: number;
  receivedQuantity: number;
  diffQuantity: number;
  unitPrice: number;
  lineTotal: number;
  totalVolumeM3: number;
  itemFamilyCode: string;
  itemFamilyName: string;
}

export interface AdjustmentItem {
  adjustmentType: string;
  memoNumber: string;
  adjustmentDate: string;
  createdBy: string;
  approvedBy: string;
  status: string;
  memoRemarks: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  uom: string;
  quantity: number;
  adjustedValue: number;
  adjustedValuePerUnit: number;
  warehouse: string;
  warehouseCode: string;
  warehouseName: string;
  qtyDb: number;
  qtyCr: number;
  glAccountCode: string;
  glCostCenter: string;
  itemFamilyCode: string;
  itemFamilyName: string;
}

export interface PrHeader {
  prNumber: string;
  prType: string;
  date: string;
  createDate: string;
  approved: string;
  approvedBy: string;
  controllerApprovedBy: string;
  importance: string;
  completePercent: number;
  inventoryUserName: string;
  voidReason: string;
}

export interface PurchaseBundle {
  purchases: ParsedPurchaseItem[];
  purchaseOrders: PurchaseOrder[];
  purchaseRequests: PurchaseRequestItem[];
  usage: UsageItem[];
  stockBalances: StockBalance[];
  goodsTransfers: GoodsTransfer[];
  adjustments: AdjustmentItem[];
  prHeaders: PrHeader[];
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