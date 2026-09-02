import { useIsMobile } from "@/hooks/use-mobile";
import { CHART_COLORS } from "@/utils/chart";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopBarChartProps {
  data: { name: string; total: number }[];
  tooltipLabel: string;
  tickFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string;
  xDomain?: [number, number];
  yWidthMobile?: number;
  yWidthDesktop?: number;
}

export default function TopBarChart({
  data,
  tooltipLabel,
  tickFormatter,
  tooltipFormatter,
  xDomain,
  yWidthMobile,
  yWidthDesktop,
}: TopBarChartProps) {
  const isMobile = useIsMobile();
  const labelWidth = isMobile
    ? (yWidthMobile ?? 120)
    : (yWidthDesktop ?? 190);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-border"
          horizontal={false}
        />
        <XAxis
          type="number"
          domain={xDomain}
          tickFormatter={(v) =>
            tickFormatter ? tickFormatter(Number(v)) : String(v)
          }
          className="text-xs text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={labelWidth}
          className="text-xs text-muted-foreground"
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => [
            tooltipFormatter
              ? tooltipFormatter(Number(value))
              : String(value),
            tooltipLabel,
          ]}
          cursor={{ fill: "var(--color-muted)" }}
          contentStyle={{ borderRadius: 8 }}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}