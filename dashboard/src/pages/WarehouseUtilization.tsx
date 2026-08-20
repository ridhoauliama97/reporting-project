import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { PieChartIcon } from "lucide-react";

export default function WarehouseUtilization() {
  return (
    <PageLayout
      title="Warehouse Utilization"
      subtitle="Tingkat pemanfaatan kapasitas gudang (rak/lokasi penyimpanan)."
    >
      <EmptyState
        icon={PieChartIcon}
        title="Data Utilisasi Gudang"
        description="Data kapasitas gudang dan tingkat pemanfaatan rak/lokasi belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}