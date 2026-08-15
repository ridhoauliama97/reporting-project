import PageLayout from '../components/PageLayout';
import EmptyState from '../components/EmptyState';
import { FolderCheckIcon } from 'lucide-react';

export default function ClosedPO() {
  return (
    <PageLayout title="PO Tertutup">
      <EmptyState
        icon={FolderCheckIcon}
        title="PO Tertutup"
        description="Status PO yang belum ter-invoice tidak dapat dihitung dari data ini — laporan ini hanya berisi transaksi yang sudah ter-invoice (PI/PN/PURBB)."
      />
    </PageLayout>
  );
}