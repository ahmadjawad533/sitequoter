import { GoogleGenAI } from "@google/genai";
import {
  GenerateQuoteInput,
  AiQuoteDraftOutput,
  aiQuoteDraftOutputSchema,
  AiQuoteLineOutput,
} from "./schemas";

/**
 * Encapsulates all Gemini AI quote drafting behind a single function.
 * Supports both live Gemini 2.5 Flash API calls and offline mock mode.
 */
export async function generateQuoteDraft(
  input: GenerateQuoteInput
): Promise<AiQuoteDraftOutput> {
  const isMock =
    process.env.AI_MODE === "mock" ||
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY.includes("placeholder") ||
    process.env.GEMINI_API_KEY.includes("your-key");

  if (isMock) {
    return generateMockQuote(input);
  }

  return generateLiveGeminiQuote(input);
}

/**
 * Realistic offline mock generator tailored to HVAC trade specialties.
 * Matches against actual price book items passed in the company's catalog.
 */
async function generateMockQuote(
  input: GenerateQuoteInput
): Promise<AiQuoteDraftOutput> {
  // Simulate AI model latency (600ms - 800ms)
  await new Promise((resolve) => setTimeout(resolve, 700));

  const { jobType, notes, priceBook } = input;
  const lowerNotes = (notes || "").toLowerCase();

  // Find best matches from the company's active price book
  const findItem = (keywords: string[]) => {
    return priceBook.find((item) =>
      keywords.some((k) => item.name.toLowerCase().includes(k.toLowerCase()))
    );
  };

  const capItem = findItem(["Capacitor", "dual run", "mfd"]);
  const contactorItem = findItem(["Contactor", "30a", "40a"]);
  const furnaceItem = findItem(["Furnace", "gas furnace", "80k", "heating unit"]);
  const condenserItem = findItem(["Condenser", "heat pump", "condensing", "3 ton"]);
  const filterItem = findItem(["Filter", "air filter", "pleated"]);
  const tuneupItem = findItem(["Tune-up", "tune up", "maintenance", "inspection"]);
  const lineSetItem = findItem(["Line Set", "copper", "tubing"]);

  const lines: AiQuoteLineOutput[] = [];
  let laborHours = 1.5;
  let laborReason = "Standard diagnostics and component replacement";
  let summary = "HVAC diagnostic and proposed repair";
  const questions: string[] = [];

  if (jobType === "repair") {
    summary = "Diagnostic found electrical component failure. Proposing replacement of run capacitor and contactor points.";
    laborHours = 1.5;
    laborReason = "1.5 hours: Perform diagnostic testing, discharge capacitor, install replacement capacitor and 30A contactor, and verify operating amp draw.";

    if (capItem) {
      lines.push({
        price_item_id: capItem.id,
        description: capItem.name,
        quantity: 1,
        unit_price: capItem.unit_price,
        cost: capItem.cost || capItem.unit_price * 0.5,
        is_unpriced: false,
        reason: "Nameplate and electrical reading indicate dual run capacitor failure causing motor hum.",
        confidence: "high",
      });
    } else {
      lines.push({
        price_item_id: null,
        description: "Dual Run Capacitor 45/5 MFD",
        quantity: 1,
        unit_price: 38,
        cost: 18,
        is_unpriced: false,
        reason: "Run capacitor reading below microfarad tolerance limit.",
        confidence: "high",
      });
    }

    if (contactorItem) {
      lines.push({
        price_item_id: contactorItem.id,
        description: contactorItem.name,
        quantity: 1,
        unit_price: contactorItem.unit_price,
        cost: contactorItem.cost || contactorItem.unit_price * 0.5,
        is_unpriced: false,
        reason: "Pitted contactor contacts with visible arc damage causing high resistance.",
        confidence: "high",
      });
    }

    // If notes mention refrigerant or low pressure, add unpriced refrigerant item
    if (lowerNotes.includes("refrigerant") || lowerNotes.includes("leak") || lowerNotes.includes("pressure")) {
      lines.push({
        price_item_id: null,
        description: "R-410A Refrigerant (per lb)",
        quantity: 2,
        unit_price: 0,
        cost: 0,
        is_unpriced: true,
        reason: "Low suction pressure observed. Requires electronic leak search and refrigerant top-off.",
        confidence: "medium",
      });
      questions.push("Confirm refrigerant type (R-410A vs R-22) from outdoor unit nameplate.");
    } else {
      questions.push("Is the outdoor disconnect switch in good condition or does it require replacement?");
    }
  } else if (jobType === "replacement") {
    summary = "System replacement proposal for aging, inefficient heating and cooling equipment.";
    laborHours = 6.0;
    laborReason = "6.0 hours: Two-technician crew to recover refrigerant, disconnect existing equipment, install new unit, braze lines with nitrogen purge, evacuate to 500 microns, and commission system.";

    if (condenserItem) {
      lines.push({
        price_item_id: condenserItem.id,
        description: condenserItem.name,
        quantity: 1,
        unit_price: condenserItem.unit_price,
        cost: condenserItem.cost || condenserItem.unit_price * 0.65,
        is_unpriced: false,
        reason: "Existing outdoor condenser has reached end of design service life.",
        confidence: "high",
      });
    } else if (furnaceItem) {
      lines.push({
        price_item_id: furnaceItem.id,
        description: furnaceItem.name,
        quantity: 1,
        unit_price: furnaceItem.unit_price,
        cost: furnaceItem.cost || furnaceItem.unit_price * 0.65,
        is_unpriced: false,
        reason: "Primary heat exchanger cracked or rusted beyond repairable threshold.",
        confidence: "high",
      });
    } else {
      lines.push({
        price_item_id: null,
        description: "High-Efficiency 3-Ton Heat Pump System",
        quantity: 1,
        unit_price: 3200,
        cost: 2100,
        is_unpriced: false,
        reason: "Matched equipment replacement to properly condition home square footage.",
        confidence: "high",
      });
    }

    if (lineSetItem) {
      lines.push({
        price_item_id: lineSetItem.id,
        description: lineSetItem.name,
        quantity: 1,
        unit_price: lineSetItem.unit_price,
        cost: lineSetItem.cost || lineSetItem.unit_price * 0.6,
        is_unpriced: false,
        reason: "Replace old copper line set to ensure proper refrigerant flow and R-410A oil cleanliness.",
        confidence: "high",
      });
    }

    questions.push("Verify existing electrical panel breaker size (must support 30A/40A minimum).");
    questions.push("Is the existing line set chase easily accessible through the attic or basement?");
  } else {
    // Maintenance
    summary = "Comprehensive seasonal HVAC tune-up and performance verification.";
    laborHours = 1.0;
    laborReason = "1.0 hour: Chemical coil wash, blower inspection, capacitor and contactor electrical testing, and condensate drain flush.";

    if (tuneupItem) {
      lines.push({
        price_item_id: tuneupItem.id,
        description: tuneupItem.name,
        quantity: 1,
        unit_price: tuneupItem.unit_price,
        cost: tuneupItem.cost || 15,
        is_unpriced: false,
        reason: "Scheduled seasonal maintenance to restore seasonal energy efficiency.",
        confidence: "high",
      });
    } else {
      lines.push({
        price_item_id: null,
        description: "AC Multi-Point System Tune-Up",
        quantity: 1,
        unit_price: 149,
        cost: 25,
        is_unpriced: false,
        reason: "Comprehensive system clean and safety check.",
        confidence: "high",
      });
    }

    if (filterItem) {
      lines.push({
        price_item_id: filterItem.id,
        description: filterItem.name,
        quantity: 1,
        unit_price: filterItem.unit_price,
        cost: filterItem.cost || filterItem.unit_price * 0.4,
        is_unpriced: false,
        reason: "Replace restricted return air filter to protect blower motor.",
        confidence: "high",
      });
    }

    questions.push("Confirm preferred air filter replacement schedule with homeowner.");
  }

  return {
    summary,
    lines,
    labor_hours: laborHours,
    labor_reason: laborReason,
    questions,
  };
}

/**
 * Live Google Gemini 2.5 Flash API quote generator with strict price book matching.
 */
async function generateLiveGeminiQuote(
  input: GenerateQuoteInput
): Promise<AiQuoteDraftOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format price book catalog as compact reference table for prompt
  const catalogText = input.priceBook
    .map(
      (item) =>
        `- ID: "${item.id}" | Name: "${item.name}" | Category: "${item.category}" | Price: $${item.unit_price} | Cost: $${item.cost || 0} | Unit: "${item.unit}"`
    )
    .join("\n");

  const systemInstruction = `You are an expert residential HVAC estimator for SiteQuote, a quoting tool for field HVAC contractors.
Your task is to analyze job photos and technician notes, and produce an accurate, professional quote draft.

STRICT PRICE-BOOK-ONLY RULES:
1. You MUST select parts and materials ONLY from the provided Price Book catalog.
2. For each matched item, you must supply the exact "price_item_id", "description", and "unit_price" from the catalog.
3. NEVER invent fake part numbers or prices.
4. If a necessary part is NOT in the price book (e.g. specialized coil, refrigerant, specific circuit board), mark "is_unpriced": true, set "price_item_id": null, and set "unit_price": 0.
5. Provide a concise, 1-sentence "reason" for every line item explaining why it is required based on the equipment condition or symptoms.
6. Estimate realistic labor hours in increments of 0.25 (e.g., 1.0, 1.25, 1.5, 2.0, 4.0, 6.0) based on typical residential HVAC service times, and provide a clear "labor_reason".
7. Formulate 1-3 specific "questions" for the technician if photos or notes have ambiguities (e.g. unknown refrigerant, obscured data plate, line set sizing).

Return valid JSON conforming to the requested schema.`;

  const prompt = `JOB DETAILS:
- Job Type: ${input.jobType.toUpperCase()}
- Technician Notes: ${input.notes || "None provided"}
- Company Labor Rate: $${input.companySettings.labor_rate}/hr
- Company Markup: ${input.companySettings.markup_percent}%

AVAILABLE COMPANY PRICE BOOK:
${catalogText || "No price items in company catalog. Mark required parts as unpriced."}

Review the job and photos, match needed parts against the price book, estimate labor hours, and output the quote draft JSON.`;

  const contents: any[] = [prompt];

  // Attach photos as inlineData if available
  if (input.photos && input.photos.length > 0) {
    for (const photo of input.photos) {
      if (photo.base64) {
        contents.push({
          inlineData: {
            mimeType: photo.mimeType || "image/jpeg",
            data: photo.base64.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }
    }
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2, // Low temperature for consistent catalog matching
    },
  });

  const responseText = response.text || "";
  if (!responseText.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    const parsed = JSON.parse(responseText);
    return aiQuoteDraftOutputSchema.parse(parsed);
  } catch (err: any) {
    console.error("Gemini response parsing error:", err, "Raw response:", responseText);
    // Fall back to robust mock if Gemini returned invalid format
    return generateMockQuote(input);
  }
}
