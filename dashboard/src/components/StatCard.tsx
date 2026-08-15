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
            "mt-1 truncate text-xl font-semibold tabular-nums md:text-3xl",
            accent ? "text-primary-foreground" : "text-foreground"
          )}
          title={String(value)}
        >
          {value}
        </div>
        {subtitle && (
          <div
            className={cn(
              "mt-1 truncate text-xs",
              accent ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
            title={subtitle}
          >
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
}