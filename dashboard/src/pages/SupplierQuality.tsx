import PageLayout from '../components/PageLayout';
import EmptyState from '../components/EmptyState';
import { ShieldCheckIcon } from 'lucide-react';

export default function SupplierQuality() {
  return (
    <PageLayout title="Kualitas Supplier">
      <EmptyState
        icon={ShieldCheckIcon}
        title="Data Kualitas Supplier"
        description="Data kualitas supplier (reject/QC) belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}