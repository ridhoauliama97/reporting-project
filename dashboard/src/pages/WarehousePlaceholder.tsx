import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { WarehouseIcon } from "lucide-react";

interface WarehousePlaceholderProps {
  name: string;
}

export default function WarehousePlaceholder({
  name,
}: WarehousePlaceholderProps) {
  return (
    <PageLayout title={name}>
      <EmptyState
        icon={WarehouseIcon}
        title={name}
        description="Data stok dan aktivitas gudang ini belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}
