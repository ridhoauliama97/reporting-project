import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { PackageIcon } from "lucide-react";

export default function PackingAccuracy() {
  return (
    <PageLayout
      title="Packing Accuracy"
      subtitle="Akurasi proses packing (pengemasan) terhadap spesifikasi pesanan."
    >
      <EmptyState
        icon={PackageIcon}
        title="Data Akurasi Packing"
        description="Data proses packing (kemasan sesuai vs keluhan/retur) belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}