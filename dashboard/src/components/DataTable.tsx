import { useEffect, useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon, Columns3Icon, DownloadIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

interface ColumnGroup {
  name: string;
  columns: string[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  showExport?: boolean;
  showColumnToggle?: boolean;
  defaultVisible?: string[];
  columnGroups?: ColumnGroup[];
  title?: string;
  totalColumns?: string[];
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 20,
  searchable = false,
  searchFields = [],
  showExport = false,
  showColumnToggle = false,
  defaultVisible = [],
  columnGroups = [],
  title = 'data-pembelian',
  totalColumns = [],
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(defaultVisible.length > 0 ? defaultVisible : columns.map((c) => c.key))
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollIndicators = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollIndicators();
    window.addEventListener('resize', updateScrollIndicators);
    return () => window.removeEventListener('resize', updateScrollIndicators);
  }, [data, visibleColumns]);

  const filteredData = searchable && searchTerm
    ? data.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const sortedData = sortConfig
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const comparison = String(aVal).localeCompare(String(bVal), 'id', { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const visibleColumnsList = columns.filter((c) => visibleColumns.has(c.key));

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getExportData = () => {
    const headers = visibleColumnsList.map((c) => c.label);
    const rows = sortedData.map((item) =>
      visibleColumnsList.map((c) => {
        const value = item[c.key];
        return value ?? '-';
      })
    );
    return { headers, rows };
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => {
          const strValue = String(cell);
          return strValue.includes(',') ? `"${strValue}"` : strValue;
        }).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const { headers, rows } = getExportData();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pembelian');
    XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(14);
    doc.text('Laporan Data Pembelian', 14, 15);
    doc.setFontSize(10);
    doc.text(`Diekspor: ${new Date().toLocaleDateString('id-ID')} | Total: ${rows.length} baris`, 14, 22);
    autoTable(doc, {
      head: [headers],
      body: rows.map((row) => row.map(String)),
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`${title}.pdf`);
  };

  const hasGrouping = columnGroups.length > 0;
  const allColumnKeys = new Set(columns.map((c) => c.key));

  const totals = useMemo(() => {
    if (totalColumns.length === 0) return null;
    const acc: Record<string, number> = {};
    totalColumns.forEach((key) => {
      acc[key] = paginatedData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    });
    return acc;
  }, [totalColumns, paginatedData]);

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {searchable && (
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 pl-8 md:h-9"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-sm text-muted-foreground">
            {sortedData.length} baris
          </span>
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 md:h-8">
                  <Columns3Icon />
                  Kolom
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  {hasGrouping ? (
                    columnGroups.map((group) => {
                      return (
                        <div key={group.name}>
                          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                            {group.name}
                          </DropdownMenuLabel>
                          <DropdownMenuGroup>
                            {group.columns.map((key) => {
                              const col = columns.find((c) => c.key === key);
                              if (!col) return null;
                              return (
                                <DropdownMenuCheckboxItem
                                  key={key}
                                  checked={visibleColumns.has(key)}
                                  onCheckedChange={() => toggleColumn(key)}
                                >
                                  {col.label}
                                </DropdownMenuCheckboxItem>
                              );
                            })}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                        </div>
                      );
                    })
                  ) : (
                    columns.map((col) => (
                      <DropdownMenuCheckboxItem
                        key={col.key}
                        checked={visibleColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      >
                        {col.label}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setVisibleColumns(new Set(allColumnKeys))}
                >
                  Tampilkan semua kolom
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {showExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 md:h-8">
                  <DownloadIcon />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleExportCSV}>CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportExcel}>Excel</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleExportPDF}>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={updateScrollIndicators}
          className="overflow-x-auto"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {visibleColumnsList.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      col.sortable && "cursor-pointer select-none",
                      col.key === visibleColumnsList[0]?.key &&
                        "sticky left-0 z-10 border-r border-border bg-muted/50"
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ textAlign: col.align === 'right' ? 'right' : 'left' }}
                  >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortConfig?.key === col.key ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="size-3.5" />
                        ) : (
                          <ChevronDownIcon className="size-3.5" />
                        )
                      ) : (
                        <ChevronsUpDownIcon className="size-3.5 opacity-50" />
                      )
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnsList.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, idx) => (
                <TableRow key={idx} className="group">
                  {visibleColumnsList.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap tabular-nums",
                        col.key === visibleColumnsList[0]?.key &&
                          "sticky left-0 z-10 border-r border-border bg-card group-hover:bg-muted/50"
                      )}
                      style={{ textAlign: col.align === 'right' ? 'right' : 'left' }}
                    >
                      {col.render ? col.render(item) : (item[col.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {totals && (
            <TableFooter>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {visibleColumnsList.map((col) => {
                  const isFirst = col.key === visibleColumnsList[0]?.key;
                  const stickyClass = isFirst
                    ? "sticky left-0 z-10 border-r border-border bg-muted/50"
                    : "";
                  if (isFirst) {
                    return (
                      <TableCell
                        key={col.key}
                        className={cn("font-semibold", stickyClass)}
                        style={{ textAlign: col.align === 'right' ? 'right' : 'left' }}
                      >
                        Total
                      </TableCell>
                    );
                  }
                  if (Object.prototype.hasOwnProperty.call(totals, col.key)) {
                    return (
                      <TableCell
                        key={col.key}
                        className={cn("font-semibold tabular-nums", stickyClass)}
                        style={{ textAlign: col.align === 'right' ? 'right' : 'left' }}
                      >
                        {col.render
                          ? col.render({ [col.key]: totals[col.key] } as T)
                          : totals[col.key]}
                      </TableCell>
                    );
                  }
                  return <TableCell key={col.key} className={stickyClass} />;
                })}
              </TableRow>
            </TableFooter>
          )}
        </Table>
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent transition-opacity duration-200 dark:from-white/10",
            canScrollRight ? "opacity-100" : "opacity-0"
          )}
          aria-hidden
        />
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1}–{Math.min(startIndex + pageSize, sortedData.length)} dari{" "}
            {sortedData.length} · Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 md:h-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon />
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 md:h-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Berikutnya
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}