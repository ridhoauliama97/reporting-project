import { useEffect, useRef, useState } from "react";
import type { DateRange } from "../types/ui";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DateFilterProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

function formatDateDisplay(date: Date | null): string {
  if (!date) return "";
  return format(date, "dd MMM yyyy", { locale: id });
}

function parseDateInput(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y ? date : null;
}

export default function DateFilter({ dateRange, onChange }: DateFilterProps) {
  const [startInput, setStartInput] = useState(() =>
    formatDateForInput(dateRange.start),
  );
  const [endInput, setEndInput] = useState(() =>
    formatDateForInput(dateRange.end),
  );
  const latest = useRef({ start: startInput, end: endInput });
  latest.current = { start: startInput, end: endInput };

  useEffect(() => {
    setStartInput(formatDateForInput(dateRange.start));
    setEndInput(formatDateForInput(dateRange.end));
  }, [dateRange.start, dateRange.end]);

  useEffect(() => {
    latest.current = { start: startInput, end: endInput };
  }, [startInput, endInput]);

  const commit = (startStr: string, endStr: string) => {
    const start = parseDateInput(startStr);
    const end = parseDateInput(endStr);
    onChange({
      start: start
        ? new Date(start.getFullYear(), start.getMonth(), start.getDate())
        : null,
      end: end
        ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
        : null,
    });
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartInput(value);
    latest.current.start = value;
    commit(value, latest.current.end);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndInput(value);
    latest.current.end = value;
    commit(latest.current.start, value);
  };

  const reversed =
    dateRange.start !== null &&
    dateRange.end !== null &&
    dateRange.end < dateRange.start;

  const label = reversed
    ? "Rentang tidak valid"
    : dateRange.start
      ? dateRange.end
        ? `${formatDateDisplay(dateRange.start)} – ${formatDateDisplay(dateRange.end)}`
        : `Mulai ${formatDateDisplay(dateRange.start)}`
      : dateRange.end
        ? `Sampai ${formatDateDisplay(dateRange.end)}`
        : "Semua Data";

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="size-4 shrink-0" />
        <span className="truncate font-medium text-foreground">{label}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <Input
          type="date"
          value={startInput}
          onChange={handleStartChange}
          className="h-11 min-w-0 w-full sm:h-9 sm:w-fit"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="date"
          value={endInput}
          onChange={handleEndChange}
          className="h-11 min-w-0 w-full sm:h-9 sm:w-fit"
        />
      </div>
      {reversed && (
        <p className="w-full text-xs text-destructive sm:w-auto">
          Tanggal mulai tidak boleh melewati tanggal selesai.
        </p>
      )}
    </div>
  );
}