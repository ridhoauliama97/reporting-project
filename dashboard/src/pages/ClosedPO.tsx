import type { PurchaseOrder } from "../types/purchase";
import PurchaseOrderStatus from "./PurchaseOrderStatus";
import { FolderCheckIcon } from "lucide-react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface ClosedPOProps {
  purchaseOrders: PurchaseOrder[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function ClosedPO({
  purchaseOrders,
  dateRange,
  onDateRangeChange,
}: ClosedPOProps) {
  return (
    <PurchaseOrderStatus
      purchaseOrders={purchaseOrders}
      status="CLOSED"
      title="Closed PO"
      subtitle="Purchase Order yang seluruh item-nya sudah diterima penuh (qty diterima = qty pesan)."
      emptyTitle="Tidak ada Closed PO"
      emptyDescription="Tidak ada PO dengan penerimaan penuh pada rentang tanggal ini."
      icon={FolderCheckIcon}
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    />
  );
}