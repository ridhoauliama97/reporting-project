import PageLayout from "../components/PageLayout";
import EmptyState from "../components/EmptyState";
import { BrainCircuitIcon } from "lucide-react";

export default function AnalyticsInsights() {
  return (
    <PageLayout
      title="AI Insights & Analytics"
      subtitle="Wawasan analitik dan kecerdasan buatan untuk pengambilan keputusan pembelian."
    >
      <EmptyState
        icon={BrainCircuitIcon}
        title="Segera Hadir"
        description="Fitur AI Insights & Analytics akan tersedia di versi berikutnya."
      />
    </PageLayout>
  );
}
