import type { PurchaseOrder } from "../types/purchase";
import PurchaseOrderStatus from "./PurchaseOrderStatus";
import { ClipboardListIcon } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface OutstandingPOProps {
  purchaseOrders: PurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function OutstandingPO({
  purchaseOrders,
  dateRange,
  onDateRangeChange,
}: OutstandingPOProps) {
  return (
    <PurchaseOrderStatus
      purchaseOrders={purchaseOrders}
      status="OUTSTANDING"
      title="Outstanding PO"
      subtitle="Purchase Order yang sudah sebagian diterima namun masih memiliki sisa kuantitas yang belum diterima."
      emptyTitle="Tidak ada Outstanding PO"
      emptyDescription="Tidak ada PO dengan penerimaan sebagian (0 < qty diterima < qty pesan) pada rentang tanggal ini."
      icon={ClipboardListIcon}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    />
  );
}