import PageLayout from '../components/PageLayout';
import EmptyState from '../components/EmptyState';
import { FileTextIcon } from 'lucide-react';

export default function OpenPO() {
  return (
    <PageLayout title="PO Terbuka">
      <EmptyState
        icon={FileTextIcon}
        title="PO Terbuka"
        description="Status PO yang belum ter-invoice tidak dapat dihitung dari data ini — laporan ini hanya berisi transaksi yang sudah ter-invoice (PI/PN/PURBB)."
      />
    </PageLayout>
  );
}