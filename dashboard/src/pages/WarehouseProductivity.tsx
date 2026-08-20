import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { WorkflowIcon } from "lucide-react";

export default function WarehouseProductivity() {
  return (
    <PageLayout
      title="Warehouse Productivity"
      subtitle="Produktivitas gudang (jumlah transaksi/penerimaan per periode)."
    >
      <EmptyState
        icon={WorkflowIcon}
        title="Data Produktivitas Gudang"
        description="Data produktivitas gudang (transaksi per pegawai/per jam kerja) belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}