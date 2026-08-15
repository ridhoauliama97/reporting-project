import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { FileTextIcon } from "lucide-react";

export default function OpenPO() {
  return (
    <PageLayout
      title="Open PO"
      subtitle="Laporan status Purchase Order (PO) yang belum ter-invoice."
    >
      <EmptyState
        icon={FileTextIcon}
        title="Open PO"
        description="Status PO yang belum ter-invoice tidak dapat dihitung dari data ini — laporan ini hanya berisi transaksi yang sudah ter-invoice (PI/PN/PURBB)."
      />
    </PageLayout>
  );
}
