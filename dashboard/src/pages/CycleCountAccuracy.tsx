import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { ListChecksIcon } from "lucide-react";

export default function CycleCountAccuracy() {
  return (
    <PageLayout
      title="Cycle Count Accuracy"
      subtitle="Akurasi hasil stock opname (cycle count) terhadap saldo sistem."
    >
      <EmptyState
        icon={ListChecksIcon}
        title="Data Cycle Count"
        description="Data hasil cycle count / stock opname belum tersedia di sumber data saat ini."
      />
    </PageLayout>
  );
}