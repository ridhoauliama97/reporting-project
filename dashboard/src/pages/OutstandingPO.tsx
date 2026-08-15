import PageLayout from '../components/PageLayout';
import EmptyState from '../components/EmptyState';
import { ClipboardListIcon } from 'lucide-react';

export default function OutstandingPO() {
  return (
    <PageLayout title="PO Outstanding">
      <EmptyState
        icon={ClipboardListIcon}
        title="PO Outstanding"
        description="Status PO yang belum ter-invoice tidak dapat dihitung dari data ini — laporan ini hanya berisi transaksi yang sudah ter-invoice (PI/PN/PURBB)."
      />
    </PageLayout>
  );
}