import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export default function StatCard({ title, value, subtitle, accent = false }: StatCardProps) {
  return (
    <Card
      className={cn(
        "shadow-xs transition-shadow hover:shadow-md",
        accent
          ? "border-transparent bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
          : ""
      )}
    >
      <CardContent className="p-4">
        <div
          className={cn(
            "text-sm font-medium",
            accent ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {title}
        </div>
        <div
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums",
            accent ? "text-primary-foreground" : "text-foreground"
          )}
        >
          {value}
        </div>
        {subtitle && (
          <div
            className={cn(
              "mt-1 text-xs",
              accent ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}