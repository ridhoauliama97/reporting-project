import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { TargetIcon } from "lucide-react";

export default function PickingAccuracy() {
  return (
    <PageLayout
      title="Picking Accuracy"
      subtitle="Akurasi proses picking (pengambilan barang) terhadap pesanan."
    >
      <EmptyState
        icon={TargetIcon}
        title="Data Akurasi Picking"
        description="Data proses picking (barang terambil vs barang yang dipesan) belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}