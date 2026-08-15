import type { ReactNode } from 'react';
import DateFilter from './DateFilter';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  children: ReactNode;
}

export default function PageLayout({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  children,
}: PageLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {dateRange && onDateRangeChange && (
          <DateFilter dateRange={dateRange} onChange={onDateRangeChange} />
        )}
      </div>
      {children}
    </div>
  );
}