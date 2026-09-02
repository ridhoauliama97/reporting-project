import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { ShieldCheckIcon } from "lucide-react";

export default function SupplierQuality() {
  return (
    <PageLayout
      title="Supplier Quality"
      subtitle="Laporan supplier quality (reject/QC) berdasarkan data pembelian."
    >
      <EmptyState
        icon={ShieldCheckIcon}
        title="Data Supplier Quality"
        description="Data Supplier Quality (reject/QC) belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}
