import type { PurchaseOrder } from "../types/purchase";
import PurchaseOrderStatus from "./PurchaseOrderStatus";
import { FileTextIcon } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface OpenPOProps {
  purchaseOrders: PurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function OpenPO({
  purchaseOrders,
  dateRange,
  onDateRangeChange,
}: OpenPOProps) {
  return (
    <PurchaseOrderStatus
      purchaseOrders={purchaseOrders}
      status="OPEN"
      title="Open PO"
      subtitle="Purchase Order yang masih berjalan dan belum menerima pengiriman sama sekali."
      emptyTitle="Tidak ada Open PO"
      emptyDescription="Tidak ada PO yang belum menerima pengiriman (qty diterima = 0) pada rentang tanggal ini."
      icon={FileTextIcon}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    />
  );
}