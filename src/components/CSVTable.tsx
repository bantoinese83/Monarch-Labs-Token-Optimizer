import { useMemo } from 'react';
import { parseCSV } from '@/utils/csvParser';

interface CSVTableProps {
  csv: string;
}

export function CSVTable({ csv }: CSVTableProps) {
  const rows = useMemo(() => {
    try {
      return parseCSV(csv.trim());
    } catch (error) {
      console.error('Error parsing CSV:', error);
      return [];
    }
  }, [csv]);

  if (rows.length === 0) {
    return <div className="p-4 text-sm text-[#858585] text-center">No CSV data to display</div>;
  }

  const headerRow = rows[0];
  const dataRows = rows.slice(1);

  return (
    <div className="h-full overflow-auto">
      <table
        className="w-full border-collapse text-sm font-mono"
        style={{ fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
      >
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#2d2d30] border-b border-[#3e3e42]">
            {headerRow?.map((header, index) => (
              <th
                key={index}
                className="px-3 py-2 text-left text-xs font-semibold text-[#858585] uppercase tracking-wide border-r border-[#3e3e42] last:border-r-0"
              >
                {header || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-[#3e3e42] hover:bg-[#2a2d2e] transition-colors"
            >
              {headerRow?.map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-3 py-2 text-[#cccccc] border-r border-[#3e3e42] last:border-r-0"
                >
                  {row[colIndex] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
