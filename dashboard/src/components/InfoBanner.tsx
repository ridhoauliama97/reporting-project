import { InfoIcon } from "lucide-react";

interface InfoBannerProps {
  children: React.ReactNode;
}

export default function InfoBanner({ children }: InfoBannerProps) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-dashed bg-muted/50 p-4 text-sm text-muted-foreground">
      <InfoIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}