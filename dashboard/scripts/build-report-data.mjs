import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Pipeline data dashboard.
 * Sumber: 12 file JSON terbaru (SSRS export) di RAW_DATA_DIR (default Desktop/data).
 * Hasil:
 *   purchasing-data.json -> records purchase | po | pr  (menu Purchasing + Dashboard + Analytics)
 *   warehouse-data.json  -> records stock | transfer | adjustment | usage
 *                           | production | productionMaterial | productionOutput (menu Warehouse)
 * Header SSRS ter-encode (_x0028_ dst) di-decode sebelum dipetakan.
 */

const RAW_DIR =
  process.env.RAW_DATA_DIR || "C:/Users/ridho/Desktop/data";
const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "data",
);

function decodeKey(key) {
  return String(key).replace(
    /_x([0-9A-F]{2,4})_/gi,
    (_, hex) => String.fromCharCode(parseInt(hex, 16)),
  );
}

function loadRaw(name) {
  const data = JSON.parse(readFileSync(join(RAW_DIR, `${name}.json`), "utf8"));
  if (!Array.isArray(data)) {
    throw new Error(`[${name}] bukan array data (kemungkinan metadata/summary)`);
  }
  return data.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [decodeKey(k), v]),
    ),
  );
}

function pick(row, ...names) {
  for (const n of names) {
    const v = row[n];
    if (v !== undefined && v !== null) return v;
  }
  return "";
}

function nz(value) {
  const s = String(value ?? "");
  return s;
}

/* ------------------------------------------------------------------ */
/* Purchasing                                                          */
/* ------------------------------------------------------------------ */

function mapPurchase(row) {
  return {
    recordType: "purchase",
    purchaseNumber: pick(row, "Purchase Number"),
    purchaseType: pick(row, "Purchase Type"),
    purchaseDate: pick(row, "Purchase Date"),
    dueDate: pick(row, "Due Date"),
    prNumber: pick(row, "PR Number"),
    prDate: pick(row, "PR Date"),
    poNumber: pick(row, "PO Ref.", "PO Number"),
    poDate: pick(row, "PO Date"),
    poExpectedDate: pick(row, "PO Expected Date"),
    poPiDays: nz(pick(row, "PO-PI Days")),
    prPiDays: nz(pick(row, "PR-PI Days")),
    poPiOverdueDays: nz(pick(row, "PO-PI Overdue Days")),
    referenceNumber: pick(row, "Reference Number"),
    transitStatus: pick(row, "Transit Status"),
    supplierCode: pick(row, "Supplier Code"),
    supplierName: pick(row, "Supplier Name"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    itemType: pick(row, "Item Type"),
    uom: pick(row, "UOM"),
    warehouse: pick(row, "Warehouse"),
    qtyOrdered: nz(pick(row, "Qty. Ordered")),
    quantity: nz(pick(row, "Quantity")),
    unitCost: nz(pick(row, "Unit Cost")),
    poUnitCost: nz(pick(row, "PO Unit Cost")),
    netTotal: nz(pick(row, "Net Total")),
    requestedBy: pick(row, "Requested By"),
    usedBy: pick(row, "Used By"),
    poCreator: pick(row, "PO Creator"),
    poApprovedBy: pick(row, "PO Approved By"),
  };
}

function mapPo(row) {
  const ordered = Number(pick(row, "Qty. Ordered (Major)", "Qty. Ordered") || 0);
  const delivered = Number(
    pick(row, "Qty. Delivered (Major)", "Qty. Delivered (Smallest)") || 0,
  );
  let status;
  if (Number.isFinite(ordered) && ordered > 0 && delivered >= ordered) {
    status = "CLOSED";
  } else if (Number.isFinite(delivered) && delivered > 0) {
    status = "OUTSTANDING";
  } else {
    status = "OPEN";
  }
  return {
    recordType: "po",
    orderNumber: pick(row, "Order Number"),
    orderDate: pick(row, "Order Date"),
    expectedDeliveryDate: pick(row, "Expected Delivery Date", "Expected Delivery Date (Master)"),
    status,
    importance: pick(row, "Importance"),
    terms: pick(row, "Terms"),
    incoterm: pick(row, "Incoterm"),
    deliveryDays: nz(pick(row, "Delivery Days")),
    poPiDays: nz(pick(row, "PO-PI Days")),
    supplierCode: pick(row, "Supplier Code"),
    supplierName: pick(row, "Supplier Name"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    qtyOrdered: nz(pick(row, "Qty. Ordered (Major)", "Qty. Ordered")),
    qtyDelivered: nz(pick(row, "Qty. Delivered (Major)", "Qty. Delivered (Smallest)")),
    qtyOutstanding: nz(pick(row, "Qty. Outstanding (Major)", "Qty. Outstanding (Smallest)")),
    pctDelivered: nz(pick(row, "Purchase Order % Delivered", "Item % Delivered")),
    itemUnitCost: nz(pick(row, "Item Unit Cost")),
    orderNetTotal: nz(pick(row, "Order Net Total")),
    prNumber: pick(row, "PR Number"),
    prDate: pick(row, "PR Date"),
    requestedBy: pick(row, "Requested By"),
    usedBy: pick(row, "Used By"),
    targetWarehouse: pick(row, "Target Warehouse"),
    purchaseInvoice: pick(row, "Purchase Invoice"),
    lastPurchaseNumber: pick(row, "Last Purchase Number"),
    createdBy: pick(row, "Created By"),
    approvedBy: pick(row, "Approved By"),
  };
}

function mapPr(row) {
  return {
    recordType: "pr",
    prNumber: pick(row, "PR Number"),
    prDate: pick(row, "PR Date"),
    status: pick(row, "Status"),
    openClosed: pick(row, "Open/Closed"),
    importance: pick(row, "Importance"),
    requiredDate: pick(row, "Required Date"),
    approvedBy: pick(row, "Approved By"),
    requestedBy: pick(row, "Requested By"),
    prPiDays: nz(pick(row, "PR-PI Days")),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    qtyRequested: nz(pick(row, "Qty. Requested", "Qty. Requested (Smallest)")),
    qtyOutstanding: nz(pick(row, "Qty. Outstanding")),
    qtyPurchased: nz(pick(row, "Qty. Purchased", "Qty. Purchased (Smallest)")),
    qtyRevised: nz(pick(row, "Qty. Revised")),
    supplierCode: pick(row, "Supplier Code"),
    supplierName: pick(row, "Supplier Name"),
    poNumber: pick(row, "PO Number"),
    poDate: pick(row, "PO Date"),
    poExpectedDate: pick(row, "PO Expected Date"),
    warehouseCode: pick(row, "Warehouse Code"),
    purpose: pick(row, "Purpose"),
  };
}

/* ------------------------------------------------------------------ */
/* Warehouse                                                           */
/* ------------------------------------------------------------------ */

function mapStock(row) {
  return {
    recordType: "stock",
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    itemType: pick(row, "Item Type"),
    uom: pick(row, "UOM", "Smallest UOM"),
    warehouseCode: pick(row, "Warehouse Code", "WarehouseID"),
    warehouseName: pick(row, "Warehouse Name", "Warehouse"),
    onHand: nz(pick(row, "On Hand", "On Hand Detail")),
    outstandingPO: nz(pick(row, "Outstanding PO")),
    outstandingSO: nz(pick(row, "Outstanding SO")),
    qtyInTransit: nz(pick(row, "Qty. In Transit")),
    qtyBlocked: nz(pick(row, "Qty. Blocked")),
    qtyMinimumOrder: nz(pick(row, "Qty. Minimum Order")),
    lastPurchaseDate: pick(row, "Last Purchase Date"),
    lastPurchaseCost: nz(pick(row, "Last Purchase Cost", "COG")),
    lastPurchaseQuantity: nz(pick(row, "Last Purchase Quantity")),
    lastPurchaseNumber: pick(row, "Last Purchase Number"),
    lastSupplierCode: pick(row, "Last Supplier Code"),
    lastSupplierName: pick(row, "Last Supplier Name"),
    lastUsageDate: pick(row, "Last Usage Date"),
    daysSinceLastUsage: nz(pick(row, "Days Since Last Usage")),
    age: nz(pick(row, "Age")),
    discontinued: pick(row, "Discontinued", "DMS"),
    shelfCode: pick(row, "Shelf Code"),
    status: pick(row, "Status"),
    date: pick(row, "Date"),
  };
}

function mapTransfer(row) {
  return {
    recordType: "transfer",
    memoNumber: pick(row, "Memo Number"),
    transferDate: pick(row, "Transfer Date"),
    receivedDate: pick(row, "Received Date"),
    received: pick(row, "Received"),
    void: pick(row, "Void"),
    goodsTransferType: pick(row, "Goods Transfer Type"),
    originWarehouseCode: pick(row, "Origin Warehouse Code"),
    originWarehouseName: pick(row, "Origin Warehouse"),
    destinationWarehouseCode: pick(row, "Destination Warehouse Code"),
    destinationWarehouseName: pick(row, "Destination Warehouse"),
    transitWarehouseCode: pick(row, "Transit Warehouse Code"),
    transitWarehouseName: pick(row, "Transit Warehouse Name"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    quantity: nz(pick(row, "Quantity")),
    receivedQuantity: nz(pick(row, "Received Quantity")),
    unitPrice: nz(pick(row, "Unit Price")),
    lineTotal: nz(pick(row, "Line Total")),
    purpose: pick(row, "Purpose"),
    createdBy: pick(row, "Created By"),
  };
}

function mapAdjustment(row) {
  return {
    recordType: "adjustment",
    memoNumber: pick(row, "Memo Number"),
    adjustmentDate: pick(row, "Adjustment Date"),
    adjustmentType: pick(row, "Adjustment Type"),
    status: pick(row, "Status"),
    postAs: pick(row, "Post As"),
    approvedBy: pick(row, "Approved By"),
    createdBy: pick(row, "Created By", "Create Date"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    quantity: nz(pick(row, "Quantity")),
    quantityCR: nz(pick(row, "Quantity (CR)")),
    quantityDB: nz(pick(row, "Quantity (DB)")),
    adjustedValue: nz(pick(row, "Adjusted Value")),
    adjustedValuePerUnit: nz(pick(row, "Adjusted Value/Unit")),
    warehouseCode: pick(row, "Warehouse Code"),
    warehouseName: pick(row, "Warehouse Name", "Warehouse"),
    memoRemarks: pick(row, "Memo Remarks"),
  };
}

function mapUsage(row) {
  return {
    recordType: "usage",
    usageNumber: pick(row, "Usage Number"),
    usageDate: pick(row, "Usage Date"),
    effectiveDate: pick(row, "Effective Date"),
    usageType: pick(row, "Usage Type"),
    purpose: pick(row, "Purpose"),
    requestedBy: pick(row, "Requested By"),
    requestedByName: pick(row, "Requested By Name"),
    usedByCode: pick(row, "Used By Code"),
    usedByName: pick(row, "Used By Name"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    quantity: nz(pick(row, "Quantity")),
    quantityReturned: nz(pick(row, "Quantity Returned")),
    qtyReturned: nz(pick(row, "Qty. Returned")),
    totalCost: nz(pick(row, "Total Cost")),
    cost: nz(pick(row, "Cost")),
    warehouseCode: pick(row, "Warehouse Code"),
    warehouseName: pick(row, "Warehouse Name", "Warehouse"),
    employeeRelation: pick(row, "Employee Relation"),
    brokenNotReturnedReason: pick(row, "Broken Not Returned Reason"),
    memoRemarks: pick(row, "Memo Remarks"),
    createdBy: pick(row, "Created By"),
  };
}

function mapProduction(row) {
  return {
    recordType: "production",
    productionNumber: pick(row, "Production Number"),
    productionType: pick(row, "Production Type"),
    productionDate: pick(row, "Production Date"),
    requiredDate: pick(row, "Required Date"),
    pic: pick(row, "PIC"),
    lineName: pick(row, "Line Name"),
    machine: pick(row, "Machine"),
    operator: pick(row, "Operator"),
    productionTime: pick(row, "Production Time"),
    productionHour: nz(pick(row, "Production Hour")),
    process: pick(row, "Process"),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    quantity: nz(pick(row, "Quantity")),
    cog: nz(pick(row, "COG")),
    totalCog: nz(pick(row, "Total COG")),
    warehouse: pick(row, "Warehouse"),
    batchNo: pick(row, "Batch No."),
    createdBy: pick(row, "Created By"),
    createdDate: pick(row, "Created Date/Time"),
  };
}

function mapProductionMaterial(row) {
  return {
    recordType: "productionMaterial",
    productionNumber: pick(row, "Production Number"),
    productionType: pick(row, "Production Type"),
    productionDate: pick(row, "Production Date"),
    pic: pick(row, "PIC"),
    lineName: pick(row, "Line Name"),
    machine: pick(row, "Machine"),
    operator: pick(row, "Operator"),
    productionHour: nz(pick(row, "Production Hour")),
    assemblyItemCode: pick(row, "AssemblyItemID", "Assembly Item Code"),
    assemblyItemName: pick(row, "Assembly Item Name"),
    itemCode: pick(row, "Material Item Code"),
    itemName: pick(row, "Material Item Name"),
    itemCategory: pick(row, "Material Category", "Item Category"),
    uom: pick(row, "UOM"),
    estUom: pick(row, "Est. UOM"),
    quantity: nz(pick(row, "Quantity")),
    estQuantity: nz(pick(row, "Est. Quantity")),
    cog: nz(pick(row, "COG")),
    totalCog: nz(pick(row, "Total COG")),
    warehouse: pick(row, "Warehouse"),
    batchNo: pick(row, "Batch No."),
    createdBy: pick(row, "Created By"),
  };
}

function mapProductionOutput(row) {
  return {
    recordType: "productionOutput",
    productionNumber: pick(row, "Production Number"),
    productionType: pick(row, "Production Type"),
    productionDate: pick(row, "Production Date"),
    pic: pick(row, "PIC"),
    lineName: pick(row, "Line Name"),
    machine: pick(row, "Machine"),
    operator: pick(row, "Operator"),
    productionHour: nz(pick(row, "Production Hour")),
    itemCode: pick(row, "Item Code"),
    itemName: pick(row, "Item Name"),
    itemCategory: pick(row, "Item Category"),
    uom: pick(row, "UOM"),
    quantity: nz(pick(row, "Quantity")),
    originalQuantity: nz(pick(row, "Original Quantity")),
    costOfGood: nz(pick(row, "Cost of Good")),
    totalCostOfGood: nz(pick(row, "Total Cost of Good")),
    totalWaste: nz(pick(row, "Total Waste")),
    warehouse: pick(row, "Warehouse"),
    batchNo: pick(row, "Batch No."),
    createdBy: pick(row, "Created By"),
  };
}

/* ------------------------------------------------------------------ */

function build() {
  const purchases = loadRaw("AnlReports_Inventory_PurchaseByItem").map(mapPurchase);
  const pos = loadRaw("AnlReports_Inventory_PurchaseOrderByItem").map(mapPo);
  const prs = loadRaw("AnlReports_Inventory_PurchaseRequestByItem").map(mapPr);
  const stocks = loadRaw("AnlReports_Inventory_StockBalance").map(mapStock);
  const transfers = loadRaw("AnlReports_Inventory_GoodsTransferByItem").map(mapTransfer);
  const adjustments = loadRaw("AnlReports_Inventory_AdjustmentByItem").map(mapAdjustment);
  const usages = loadRaw("AnlReports_Inventory_UsageByItem").map(mapUsage);
  const productions = loadRaw("AnlReports_Inventory_Production").map(mapProduction);
  const productionMaterials = loadRaw(
    "AnlReports_Inventory_ProductionMaterialUsedByItem",
  ).map(mapProductionMaterial);
  const productionOutputs = loadRaw(
    "AnlReports_Inventory_ProductionOutputByItem",
  ).map(mapProductionOutput);

  const purchasingData = [
    ...purchases,
    ...pos,
    ...prs,
  ];
  const warehouseData = [
    ...stocks,
    ...transfers,
    ...adjustments,
    ...usages,
    ...productions,
    ...productionMaterials,
    ...productionOutputs,
  ];

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    join(OUT_DIR, "purchasing-data.json"),
    JSON.stringify(purchasingData),
  );
  writeFileSync(
    join(OUT_DIR, "warehouse-data.json"),
    JSON.stringify(warehouseData),
  );

  console.log(`generated purchasing-data.json + warehouse-data.json`);
  console.log(`  purchases          : ${purchases.length}`);
  console.log(`  po                 : ${pos.length}`);
  console.log(`  pr                 : ${prs.length}`);
  console.log(`  stock              : ${stocks.length}`);
  console.log(`  transfer           : ${transfers.length}`);
  console.log(`  adjustment         : ${adjustments.length}`);
  console.log(`  usage              : ${usages.length}`);
  console.log(`  production         : ${productions.length}`);
  console.log(`  productionMaterial : ${productionMaterials.length}`);
  console.log(`  productionOutput   : ${productionOutputs.length}`);
  console.log(`  purchasing data total : ${purchasingData.length}`);
  console.log(`  warehouse data total  : ${warehouseData.length}`);
}

build();