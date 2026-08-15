import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateFilter({ dateRange, onChange }: DateFilterProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      ...dateRange,
      start: value ? new Date(value) : null,
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange({
      ...dateRange,
      end: value ? new Date(value + 'T23:59:59') : null,
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'dd MMM yyyy', { locale: id });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="size-4" />
        <span className="font-medium text-foreground">
          {dateRange.start && dateRange.end
            ? `${formatDateDisplay(dateRange.start)} – ${formatDateDisplay(dateRange.end)}`
            : 'Semua Data'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={formatDateForInput(dateRange.start)}
          onChange={handleStartChange}
          className="h-9 w-fit"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="date"
          value={formatDateForInput(dateRange.end)}
          onChange={handleEndChange}
          className="h-9 w-fit"
        />
      </div>
    </div>
  );
}