export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportPayload {
  filename: string;
  title?: string;
  meta?: string;
  sheetName?: string;
  headers: (string | number)[];
  rows: (string | number)[][];
}

function escapeCsvCell(value: unknown): string {
  let s = String(value ?? "-");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv({ filename, headers, rows }: ExportPayload) {
  const csvContent = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${filename}.csv`);
}

async function exportExcel({
  filename,
  headers,
  rows,
  sheetName = "Data",
}: ExportPayload) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName.slice(0, 31).replace(/[\\/*?:[\]]/g, "_"),
  );
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

async function exportPdf({
  filename,
  title = "Laporan",
  meta,
  headers,
  rows,
}: ExportPayload) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(meta ?? "", 14, 22);
  autoTable(doc, {
    head: [headers],
    body: rows.map((row) => row.map(String)),
    startY: 28,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59] },
  });
  doc.save(`${filename}.pdf`);
}

export async function exportData(
  format: ExportFormat,
  payload: ExportPayload,
): Promise<void> {
  if (format === "csv") {
    exportCsv(payload);
  } else if (format === "excel") {
    await exportExcel(payload);
  } else {
    await exportPdf(payload);
  }
}
