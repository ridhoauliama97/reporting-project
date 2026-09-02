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

const DEBOUNCE_MS = 400;

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return format(date, "yyyy-MM-dd");
}

function formatDateDisplay(date: Date | null): string {
  if (!date) return "";
  return format(date, "dd MMM yyyy", { locale: id });
}

export default function DateFilter({ dateRange, onChange }: DateFilterProps) {
  const [startInput, setStartInput] = useState(() =>
    formatDateForInput(dateRange.start),
  );
  const [endInput, setEndInput] = useState(() =>
    formatDateForInput(dateRange.end),
  );
  const commitRef = useRef<(startStr: string, endStr: string) => void>(
    () => {},
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const commitRange = (startStr: string, endStr: string) => {
    const start = startStr ? new Date(startStr + "T00:00:00") : null;
    const end = endStr ? new Date(endStr + "T23:59:59") : null;
    let s = start;
    let e = end;
    if (s && e && e < s) e = s;
    if (s && e && s > e) s = e;
    onChange({ start: s, end: e });
  };
  commitRef.current = commitRange;

  const scheduleCommit = (startStr: string, endStr: string) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => commitRef.current(startStr, endStr),
      DEBOUNCE_MS,
    );
  };

  const flush = () => {
    clearTimeout(timerRef.current);
    commitRef.current(startInput, endInput);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    setStartInput(formatDateForInput(dateRange.start));
    setEndInput(formatDateForInput(dateRange.end));
  }, [dateRange.start, dateRange.end]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartInput(value);
    scheduleCommit(value, endInput);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndInput(value);
    scheduleCommit(startInput, value);
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarIcon className="size-4 shrink-0" />
        <span className="truncate font-medium text-foreground">
          {dateRange.start && dateRange.end
            ? `${formatDateDisplay(dateRange.start)} – ${formatDateDisplay(dateRange.end)}`
            : "Semua Data"}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <Input
          type="date"
          value={startInput}
          onChange={handleStartChange}
          onBlur={flush}
          className="h-11 min-w-0 w-full sm:h-9 sm:w-fit"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="date"
          value={endInput}
          onChange={handleEndChange}
          onBlur={flush}
          className="h-11 min-w-0 w-full sm:h-9 sm:w-fit"
        />
      </div>
    </div>
  );
}