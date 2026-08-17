import { useMemo, useState } from "react";
import { AlertTriangleIcon, DownloadIcon } from "lucide-react";
import type { ParsedPurchaseItem } from "../types/purchase";
import PageLayout from "../components/PageLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { REPORTS } from "../utils/reports";
import { exportData, type ExportFormat } from "../utils/exporter";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface ReportsExportsProps {
  items: ParsedPurchaseItem[];
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function ReportsExports({
  items,
  dateRange,
  onDateRangeChange,
}: ReportsExportsProps) {
  const reportData = useMemo(
    () => REPORTS.map((report) => ({ report, data: report.getData(items) })),
    [items],
  );

  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportErrorId, setExportErrorId] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat, reportId: string) => {
    const entry = reportData.find((r) => r.report.id === reportId);
    if (!entry || entry.data.rows.length === 0 || exportingId) return;
    setExportingId(reportId);
    setExportErrorId(null);
    try {
      await exportData(format, {
        filename: `laporan-${reportId}`,
        title: entry.report.name,
        meta: `Diekspor: ${new Date().toLocaleDateString("id-ID")} | Total: ${entry.data.rows.length} baris`,
        sheetName: entry.report.name,
        headers: entry.data.headers,
        rows: entry.data.rows,
      });
    } catch (err) {
      console.error("Export failed:", err);
      setExportErrorId(reportId);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <PageLayout
      title="Reports & Exports"
      subtitle="Ekspor seluruh laporan purchasing dalam format CSV, Excel, atau PDF."
      dateRange={dateRange}
      onDateRangeChange={onDateRangeChange}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportData.map(({ report, data }) => {
          const hasData = data.rows.length > 0;
          const Icon = report.icon;
          return (
            <Card key={report.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                      <Icon className="size-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {report.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {report.description}
                      </p>
                    </div>
                  </div>
                  {hasData && (
                    <Badge className="shrink-0 bg-teal-500/10 font-medium text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                      Siap
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-2 border-t p-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 md:h-8"
                        disabled={!hasData || exportingId !== null}
                      >
                        <DownloadIcon />
                        {exportingId === report.id ? "Mengekspor…" : "Export"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleExport("csv", report.id)}
                      >
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleExport("excel", report.id)}
                      >
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleExport("pdf", report.id)}
                      >
                        PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {exportErrorId === report.id && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Gagal mengekspor
                    </span>
                  )}
                </div>
                {!hasData && (
                  <Badge
                    variant="outline"
                    className="gap-1 border-red-500/30 bg-red-500/10 font-medium text-red-600 dark:bg-red-500/20 dark:text-red-400"
                  >
                    <AlertTriangleIcon className="size-3.5" />
                    Tidak Ada Data
                  </Badge>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
