/**
 * Parse CSV string into rows and columns
 * Handles quoted fields, escaped quotes, and newlines within quotes
 */
export function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < csv.length) {
    const char = csv[i]!;
    const nextChar = csv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (inQuotes) {
      // Inside quotes, add character to field
      currentField += char;
      i++;
      continue;
    }

    // Outside quotes
    if (char === ',') {
      // Field separator
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (char === '\n' || char === '\r') {
      // Row separator
      if (char === '\r' && nextChar === '\n') {
        i += 2; // Skip \r\n
      } else {
        i++; // Skip \n or \r
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      continue;
    }

    // Regular character
    currentField += char;
    i++;
  }

  // Add last field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}
