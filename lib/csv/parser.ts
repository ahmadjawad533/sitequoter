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

export interface CsvJobInput {
  customerName: string;
  phone: string;
  address: string;
  jobType: "repair" | "replacement" | "maintenance";
  notes: string;
  status: "draft" | "sent" | "approved" | "lost";
}

export interface CsvJobParseResult {
  validItems: CsvJobInput[];
  errors: CsvRowError[];
  totalRows: number;
}

/**
 * Parses CSV text into validated HVAC jobs with customer records and row-level error reporting.
 */
export function parseJobsCsv(csvText: string): CsvJobParseResult {
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

  const nameIdx = headerCells.findIndex(
    (h) => h === "customername" || h === "name" || h === "customer"
  );
  const phoneIdx = headerCells.findIndex((h) => h === "phone" || h === "phonenumber");
  const addressIdx = headerCells.findIndex((h) => h === "address" || h === "location");
  const typeIdx = headerCells.findIndex((h) => h === "jobtype" || h === "type");
  const notesIdx = headerCells.findIndex((h) => h === "notes" || h === "description" || h === "note");
  const statusIdx = headerCells.findIndex((h) => h === "status");

  const missingColumns: string[] = [];
  if (nameIdx === -1) missingColumns.push("customer_name");
  if (addressIdx === -1) missingColumns.push("address");

  if (missingColumns.length > 0) {
    return {
      validItems: [],
      errors: [
        {
          rowNumber: 1,
          rawText: lines[0],
          message: `Missing required header column(s): ${missingColumns.join(
            ", "
          )}. Expected columns: customer_name, phone, address, job_type, notes.`,
        },
      ],
      totalRows: lines.length - 1,
    };
  }

  const validItems: CsvJobInput[] = [];
  const errors: CsvRowError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1;
    const rawLine = lines[i];

    if (!rawLine.trim()) continue;

    const cells = parseCsvLine(rawLine);

    const rawName = (cells[nameIdx] || "").trim();
    const rawPhone = phoneIdx >= 0 ? (cells[phoneIdx] || "").trim() : "(555) 000-0000";
    const rawAddress = (cells[addressIdx] || "").trim();
    const rawType = typeIdx >= 0 ? (cells[typeIdx] || "").toLowerCase().trim() : "repair";
    const rawNotes = notesIdx >= 0 ? (cells[notesIdx] || "").trim() : "";
    const rawStatus = statusIdx >= 0 ? (cells[statusIdx] || "").toLowerCase().trim() : "draft";

    if (!rawName) {
      errors.push({
        rowNumber,
        rawText: rawLine,
        message: "Customer name is required.",
      });
      continue;
    }

    if (!rawAddress) {
      errors.push({
        rowNumber,
        rawText: rawLine,
        message: "Job address is required.",
      });
      continue;
    }

    let jobType: "repair" | "replacement" | "maintenance" = "repair";
    if (rawType.includes("replace")) {
      jobType = "replacement";
    } else if (rawType.includes("maint") || rawType.includes("tune")) {
      jobType = "maintenance";
    }

    let status: "draft" | "sent" | "approved" | "lost" = "draft";
    if (["sent", "approved", "lost"].includes(rawStatus)) {
      status = rawStatus as any;
    }

    validItems.push({
      customerName: rawName,
      phone: rawPhone || "(555) 000-0000",
      address: rawAddress,
      jobType,
      notes: rawNotes,
      status,
    });
  }

  return {
    validItems,
    errors,
    totalRows: lines.length - 1,
  };
}

