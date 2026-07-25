/**
 * Utilitário para exportar arrays de objetos/linhas para arquivos CSV com suporte a acentuação UTF-8 no Excel.
 * Adiciona o marcador UTF-8 BOM (\uFEFF) para garantir abertura correta no Microsoft Excel.
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  const sanitize = (cell: any) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""'); // Escape double quotes
    return `"${str}"`;
  };

  const headerLine = headers.map(sanitize).join(";");
  const dataLines = rows.map((row) => row.map(sanitize).join(";"));
  
  // UTF-8 BOM prefix (\uFEFF) + CSV content
  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
