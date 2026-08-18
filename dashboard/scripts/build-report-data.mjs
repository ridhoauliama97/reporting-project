import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");

function load(name) {
  return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), "utf8"));
}

const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const str = (v) => (v === null || v === undefined ? "" : String(v));

function dayDiff(a, b) {
  if (!a || !b) return 0;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return 0;
  return Math.round((db - da) / 86400000);
}

const poLines = load("purchase-order-by-item");
const poByRefItem = new Map();
for (const p of poLines) {
  poByRefItem.set(`${str(p["Order Number"])}|${str(p["Item Code"])}`, p);
}

const prByNumber = new Map();
for (const p of load("purchase-request-by-item")) {
  prByNumber.set(str(p["PR Number"]), p);
}

const purchases = load("purchase-by-item").map((d) => {
  const po = poByRefItem.get(`${str(d["PO Ref."])}|${str(d["Item Code"])}`);
  const expected = po ? str(po["Expected Delivery Date (Master)"]) : "";
  const poDate = str(d["PO Date"]);
  const purchaseDate = str(d["Purchase Date"]);
  const poPiDays = dayDiff(poDate, purchaseDate);
  const plannedDays = expected && poDate ? dayDiff(poDate, expected) : 0;
  const pr = prByNumber.get(str(d["PR Number"]));
  const prRequiredDate = pr ? str(pr["Required Date"]) : "";
  return {
    purchaseDetailId: str(d["PurchaseDetailID"]),
    itemId: str(d["ItemID"]),
    purchaseNumber: str(d["Purchase Number"]),
    purchaseType: str(d["Purchase Type"]),
    purchaseDate,
    dueDate: str(d["Due Date"]),
    prNumber: str(d["PR Number"]),
    prDate: str(d["PR Date"] ?? ""),
    poNumber: str(d["PO Ref."]),
    poDate,
    poExpectedDate: expected,
    poPiDays,
    prPiDays: dayDiff(str(d["PR Date"] ?? ""), purchaseDate),
    prPoDays: dayDiff(str(d["PR Date"] ?? ""), poDate),
    requiredPrDays: dayDiff(str(d["PR Date"] ?? ""), prRequiredDate),
    prRequiredDate,
    poPiOverdueDays: Math.max(0, poPiDays - plannedDays),
    referenceNumber: str(d["Reference Number"]),
    transitStatus: str(d["Transit Status"]),
    supplierCode: str(d["Supplier Code"]),
    supplierName: str(d["Supplier Name"]),
    itemCode: str(d["Item Code"]),
    itemName: str(d["Item Name"]),
    itemCategory: str(d["Item Category"]),
    itemType: str(d["Item Type"]),
    uom: str(d["UOM"]),
    warehouse: str(d["Warehouse"]),
    qtyOrdered: num(d["Qty. Ordered"]),
    quantity: num(d["Quantity"]),
    unitCost: num(d["Unit Cost"]),
    poUnitCost: po ? num(po["Item Unit Cost"]) : num(d["Unit Cost"]),
    netTotal: num(d["Net Total"]),
    lineTotal: num(d["Line Total"]),
    lineTotalAfterTax: num(d["Line Total After Tax"]),
    qtyUsed: num(d["Qty. Used"]),
    qtyTransferred: num(d["Qty. Transferred"]),
    quantityReceived: num(d["Qty. Received"]),
    amountReceived: num(d["Amount Received"]),
    qcBy: str(d["QC By"]),
    qcComment: str(d["QC Comment"]),
    requestedBy: str(d["Requested By"]),
    usedBy: str(d["Used By"]),
    purpose: str(d["Purpose"]),
    poCreator: str(d["Created By"]),
    poApprovedBy: po ? str(po["Approved By"]) : "",
    currency: str(d["Currency"]),
    paymentTerm: num(d["Payment Term"]),
    priceGroup: str(d["Price Group"]),
    itemFamilyCode: str(d["Item Family Code"]),
    itemFamilyName: str(d["Item Family Name"]),
    itemSpecification: str(d["Item Specification"]),
    itemPartNumber: str(d["Item Part Number"]),
    supplierCity: str(d["Supplier City"]),
  };
});
purchases.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));

const poByHeader = new Map();
for (const p of poLines) {
  const key = str(p["Order Number"]);
  if (!poByHeader.has(key)) poByHeader.set(key, []);
  poByHeader.get(key).push(p);
}

function poLineStatus(p) {
  const ordered = num(p["Qty. Ordered (Major)"] || p["Qty. Ordered"]);
  const delivered = num(p["Qty. Delivered (Major)"] || p["Qty. Delivered (Smallest)"]);
  if (ordered > 0 && delivered >= ordered) return "CLOSED";
  if (delivered > 0) return "OUTSTANDING";
  return "OPEN";
}

function poHeaderStatus(lines) {
  const s = new Set(lines.map(poLineStatus));
  if (s.has("OUTSTANDING")) return "OUTSTANDING";
  if (s.has("OPEN")) return "OPEN";
  return "CLOSED";
}

const purchaseOrders = [];
for (const [orderNumber, lines] of poByHeader) {
  const header = lines[0];
  purchaseOrders.push({
    orderNumber,
    status: poHeaderStatus(lines),
    poType: str(header["PO Type"]),
    orderDate: str(header["Order Date"]),
    expectedDeliveryDate: str(header["Expected Delivery Date"]),
    importance: str(header["Importance"]),
    approved: str(header["Approved"]),
    approvedBy: str(header["Approved By"]),
    approvedDate: str(header["Approved Date/Time"]),
    supplierCode: str(header["Supplier Code"]),
    supplierName: str(header["Supplier Name"]),
    targetWarehouse: str(header["Target Warehouse"]),
    orderNetTotal: num(header["Order Net Total"]),
    purchaseOrderPercentDelivered: num(header["Purchase Order % Delivered"]),
    deliveryDays: num(header["Delivery Days"]),
    poPiDays: num(header["PO-PI Days"]),
    prNumber: str(header["PR Number"]),
    prDate: str(header["PR Date"]),
    prRequiredDate: str(header["PR Required Date"]),
    closedBy: str(header["Closed By"]),
    closedReason: str(header["Closed Reason"]),
    usedBy: str(header["Used By"]),
    requestedBy: str(header["Requested By"]),
    lines: lines.map((p) => ({
      lineStatus: poLineStatus(p),
      itemCode: str(p["Item Code"]),
      itemName: str(p["Item Name"]),
      itemCategory: str(p["Item Category"]),
      uom: str(p["UOM"]),
      qtyOrdered: num(p["Qty. Ordered (Major)"] || p["Qty. Ordered"]),
      qtyDelivered: num(p["Qty. Delivered (Major)"] || p["Qty. Delivered (Smallest)"]),
      qtyOutstanding: num(p["Qty. Outstanding (Major)"] || p["Qty. Outstanding (Smallest)"]),
      itemPercentDelivered: num(p["Item % Delivered"]),
      itemUnitCost: num(p["Item Unit Cost"]),
      lineTotal: num(p["Line Total"]),
      prNumber: str(p["PR Number"]),
      prDate: str(p["PR Date"]),
    })),
  });
}
purchaseOrders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));

const purchaseRequests = load("purchase-request-by-item").map((d) => ({
  prType: str(d["PR Type"]),
  prNumber: str(d["PR Number"]),
  prDate: str(d["PR Date"]),
  requiredDate: str(d["Required Date"]),
  importance: str(d["Importance"]),
  status: str(d["Status"]),
  approved: str(d["Approved"]),
  approvedBy: str(d["Approved By"]),
  approvedDate: str(d["Approved Date/Time"]),
  requestedBy: str(d["Requested By"]),
  itemCode: str(d["Item Code"]),
  itemName: str(d["Item Name"]),
  itemCategory: str(d["Item Category"]),
  uom: str(d["UOM"]),
  qtyRequested: num(d["Qty. Requested"]),
  qtyShipped: num(d["Qty. Shipped"]),
  qtyOnOrder: num(d["Qty. On Order"]),
  qtyOnHand: num(d["Qty. On Hand"]),
  poNumber: str(d["PO Number"]),
  poDate: str(d["PO Date"]),
  supplierCode: str(d["Supplier Code"]),
  supplierName: str(d["Supplier Name"]),
  itemRemarks: str(d["Item Remarks"]),
}));
purchaseRequests.sort((a, b) => a.prDate.localeCompare(b.prDate));

const usage = load("usage-by-item").map((d) => ({
  itemId: str(d["ItemID"]),
  usageDetailId: str(d["UsageDetailID"]),
  usageType: str(d["Usage Type"]),
  usageNumber: str(d["Usage Number"]),
  usageDate: str(d["Usage Date"]),
  effectiveDate: str(d["Effective Date"]),
  itemCode: str(d["Item Code"]),
  itemName: str(d["Item Name"]),
  itemCategory: str(d["Item Category"]),
  uom: str(d["UOM"]),
  quantity: num(d["Quantity"]),
  cost: num(d["Cost"]),
  totalCost: num(d["Total Cost"]),
  warehouse: str(d["Warehouse"]),
  warehouseCode: str(d["Warehouse Code"]),
  warehouseName: str(d["Warehouse Name"]),
  requestedBy: str(d["Requested By Name"]),
  requestedByCode: str(d["Requested By Code"]),
  requestedByDepartment: str(d["Requested By Department"]),
  purpose: str(d["Purpose"]),
  costCenterSegment1Name: str(d["Cost Center Segment 1 Name"]),
  itemRemarks: str(d["Item Remarks"]),
}));
usage.sort((a, b) => a.usageDate.localeCompare(b.usageDate));

const stockBalances = load("stock-balance").map((d) => ({
  warehouseId: str(d["WarehouseID"]),
  warehouseCode: str(d["Warehouse Code"]),
  warehouseName: str(d["Warehouse Name"]),
  itemId: str(d["ItemID"]),
  itemCode: str(d["Item Code"]),
  itemName: str(d["Item Name"]),
  itemCategory: str(d["Item Category"]),
  uom: str(d["UOM"]),
  onHand: num(d["On Hand"]),
  smallestOnHand: num(d["Smallest On Hand"]),
  outstandingSO: num(d["Outstanding SO"]),
  qtyInTransit: num(d["Qty. In Transit"]),
  qtyBlocked: num(d["Qty. Blocked"]),
  grade: str(d["Grade"]),
  discontinued: str(d["Discontinued"]),
  lastPurchaseDate: str(d["Last Purchase Date"]),
  lastPurchaseCost: num(d["Last Purchase Cost"]),
  lastPurchaseNumber: str(d["Last Purchase Number"]),
  lastPurchaseQuantity: num(d["Last Purchase Quantity"]),
  lastSupplierCode: str(d["Last Supplier Code"]),
  lastSupplierName: str(d["Last Supplier Name"]),
  priceGroup: str(d["Price Group"]),
  priceGroupCategory: str(d["Price Group Category"]),
  shelfCode: str(d["Shelf Code"]),
}));
stockBalances.sort(
  (a, b) => a.warehouseCode.localeCompare(b.warehouseCode) || a.itemCode.localeCompare(b.itemCode),
);

const goodsTransfers = load("goods-transfer-by-tem").map((d) => ({
  transferType: str(d["Goods Transfer Type"]),
  memoNumber: str(d["Memo Number"]),
  transferDate: str(d["Transfer Date"]),
  receivedDate: str(d["Received Date"]),
  received: str(d["Received"]),
  receivedBy: str(d["Received By"]),
  originWarehouse: str(d["Origin Warehouse"]),
  originWarehouseCode: str(d["Origin Warehouse Code"]),
  destinationWarehouse: str(d["Destination Warehouse"]),
  destinationWarehouseCode: str(d["Destination Warehouse Code"]),
  driverName: str(d["Driver Name"]),
  vehicleNo: str(d["Vehicle No."]),
  purpose: str(d["Purpose"]),
  itemCode: str(d["Item Code"]),
  itemName: str(d["Item Name"]),
  itemCategory: str(d["Item Category"]),
  uom: str(d["UOM"]),
  quantity: num(d["Quantity"]),
  receivedQuantity: num(d["Received Quantity"]),
  diffQuantity: num(d["Diff. Quantity"]),
  unitPrice: num(d["Unit Price"]),
  lineTotal: num(d["Line Total"]),
  totalVolumeM3: num(d["Total Volume (m3)"]),
  itemFamilyCode: str(d["Item Family Code"]),
  itemFamilyName: str(d["Item Family Name"]),
}));
goodsTransfers.sort((a, b) => a.transferDate.localeCompare(b.transferDate));

const adjustments = load("adjustment-by-item").map((d) => ({
  adjustmentType: str(d["Adjustment Type"]),
  memoNumber: str(d["Memo Number"]),
  adjustmentDate: str(d["Adjustment Date"]),
  createdBy: str(d["Created By"]),
  approvedBy: str(d["Approved By"]),
  status: str(d["Status"]),
  memoRemarks: str(d["Memo Remarks"]),
  itemCode: str(d["Item Code"]),
  itemName: str(d["Item Name"]),
  itemCategory: str(d["Item Category"]),
  uom: str(d["UOM"]),
  quantity: num(d["Quantity"]),
  adjustedValue: num(d["Adjusted Value"]),
  adjustedValuePerUnit: num(d["Adjusted Value/Unit"]),
  warehouse: str(d["Warehouse"]),
  warehouseCode: str(d["Warehouse Code"]),
  warehouseName: str(d["Warehouse Name"]),
  qtyDb: num(d["Quantity (DB)"]),
  qtyCr: num(d["Quantity (CR)"]),
  glAccountCode: str(d["GL Account Code"]),
  glCostCenter: str(d["GL Cost Center"]),
  itemFamilyCode: str(d["Item Family Code"]),
  itemFamilyName: str(d["Item Family Name"]),
}));
adjustments.sort((a, b) => a.adjustmentDate.localeCompare(b.adjustmentDate));

const prHeaders = load("purchase-request").map((d) => ({
  prNumber: str(d["PRNumber"]),
  prType: str(d["PRType"]),
  date: str(d["Date"]),
  createDate: str(d["CreateDate"]),
  approved: str(d["Approved"]),
  approvedBy: str(d["ApprovedBy"]),
  controllerApprovedBy: str(d["ControllerApprovedBy"]),
  importance: str(d["Importance"]),
  completePercent: num(d["CompletePercent"]),
  inventoryUserName: str(d["InventoryUserName"]),
  voidReason: str(d["VoidReason"]),
}));
prHeaders.sort((a, b) => a.date.localeCompare(b.date));

const bundle = {
  generatedAt: new Date().toISOString(),
  purchases,
  purchaseOrders,
  purchaseRequests,
  usage,
  stockBalances,
  goodsTransfers,
  adjustments,
  prHeaders,
};

writeFileSync(
  join(DATA_DIR, "purchasing-report-data.json"),
  JSON.stringify(bundle),
);

const fmt = (n) => n.toLocaleString("id-ID");
console.log("generated purchasing-report-data.json");
console.log("  purchases       :", fmt(purchases.length));
console.log("  purchaseOrders  :", fmt(purchaseOrders.length), "(OPEN", purchaseOrders.filter((p) => p.status === "OPEN").length, "/ OUTSTANDING", purchaseOrders.filter((p) => p.status === "OUTSTANDING").length, "/ CLOSED", purchaseOrders.filter((p) => p.status === "CLOSED").length + ")");
console.log("  purchaseRequests:", fmt(purchaseRequests.length), "(tanpa PO:", fmt(purchaseRequests.filter((p) => !p.poNumber).length) + ")");
console.log("  usage           :", fmt(usage.length));
console.log("  stockBalances   :", fmt(stockBalances.length));
console.log("  goodsTransfers  :", fmt(goodsTransfers.length));
console.log("  adjustments     :", fmt(adjustments.length));
console.log("  prHeaders       :", fmt(prHeaders.length));