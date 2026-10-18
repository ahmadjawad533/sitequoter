import { priceItemSchema, type PriceItemInput } from "@/lib/validations/priceBook";

export interface CsvRowError {
  rowNumber: number;
  rawText: string;
  message: string;
}

export interface CsvParseResult {
  validItems: PriceItemInput[];
  errors: CsvRowError[];
  totalRows: number;
}

/**
 * Parses a single CSV line into an array of cell values,
 * respecting double quotes containing commas or escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Parses CSV text into validated HVAC price items with row-level error reporting.
 */
export function parsePriceBookCsv(csvText: string): CsvParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      validItems: [],
      errors: [
        {
          rowNumber: 1,
          rawText: "",
          message: "CSV file is empty.",
        },
      ],
      totalRows: 0,
    };
  }

  // Parse header
  const headerCells = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[\s_-]+/g, "")
  );

  const nameIdx = headerCells.findIndex((h) => h === "name" || h === "item");
  const categoryIdx = headerCells.findIndex((h) => h === "category");
  const unitIdx = headerCells.findIndex((h) => h === "unit");
  const priceIdx = headerCells.findIndex(
    (h) => h === "unitprice" || h === "price" || h === "cost"
  );

  const missingColumns: string[] = [];
  if (nameIdx === -1) missingColumns.push("name");
  if (categoryIdx === -1) missingColumns.push("category");
  if (unitIdx === -1) missingColumns.push("unit");
  if (priceIdx === -1) missingColumns.push("unit_price");

  if (missingColumns.length > 0) {
    return {
      validItems: [],
      errors: [
        {
          rowNumber: 1,
          rawText: lines[0],
          message: `Missing required header column(s): ${missingColumns.join(
            ", "
          )}. Expected columns: name, category, unit, unit_price.`,
        },
      ],
      totalRows: lines.length - 1,
    };
  }

  const validItems: PriceItemInput[] = [];
  const errors: CsvRowError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1; // 1-indexed for human readability
    const rawLine = lines[i];

    if (!rawLine.trim()) continue;

    const cells = parseCsvLine(rawLine);

    const rawName = cells[nameIdx] || "";
    const rawCategory = cells[categoryIdx] || "General";
    const rawUnit = cells[unitIdx] || "each";
    const rawPrice = cells[priceIdx] || "";

    // Clean price string (strip $ and commas)
    const sanitizedPrice = rawPrice.replace(/[$,]/g, "").trim();

    const parsed = priceItemSchema.safeParse({
      name: rawName,
      category: rawCategory || "General",
      unit: rawUnit || "each",
      unit_price: sanitizedPrice,
    });

    if (parsed.success) {
      validItems.push(parsed.data);
    } else {
      const issueMessage = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "field"}: ${issue.message}`)
        .join("; ");
      errors.push({
        rowNumber,
        rawText: rawLine,
        message: issueMessage,
      });
    }
  }

  return {
    validItems,
    errors,
    totalRows: lines.length - 1,
  };
}
