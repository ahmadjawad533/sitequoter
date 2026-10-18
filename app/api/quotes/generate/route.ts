import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { generateQuoteDraft } from "@/lib/ai/generateQuote";
import { calculateQuoteTotals } from "@/lib/ai/calculator";
import { PriceItemForAi, CompanySettingsForAi } from "@/lib/ai/schemas";

// Standard starter price book fallback if company catalog is empty
const DEFAULT_PRICE_ITEMS: PriceItemForAi[] = [
  { id: "pi-cap-1", name: "Capacitor 45/5 MFD Dual Run", category: "Parts", unit: "each", unit_price: 38, cost: 14 },
  { id: "pi-con-1", name: "Contactor 30A Single Pole", category: "Parts", unit: "each", unit_price: 42, cost: 16 },
  { id: "pi-mot-1", name: "Condenser Fan Motor 1/3 HP", category: "Motors", unit: "each", unit_price: 185, cost: 85 },
  { id: "pi-thm-1", name: "Thermostat Smart Pro", category: "Controls", unit: "each", unit_price: 165, cost: 80 },
  { id: "pi-ref-1", name: "R-410A Refrigerant (per lb)", category: "Refrigerants", unit: "lb", unit_price: 45, cost: 18 },
  { id: "pi-tun-1", name: "Seasonal AC Maintenance Tune-Up", category: "Services", unit: "service", unit_price: 129, cost: 20 },
  { id: "pi-fur-1", name: "High-Efficiency 80k BTU Gas Furnace", category: "Equipment", unit: "each", unit_price: 2450, cost: 1600 },
  { id: "pi-hpt-1", name: "3-Ton 16 SEER2 Heat Pump Condenser", category: "Equipment", unit: "each", unit_price: 3100, cost: 2100 },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, jobType = "repair", notes = "", photos = [], priceBook = [], companySettings } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required jobId parameter." },
        { status: 400 }
      );
    }

    const isMock =
      process.env.AUTH_MODE === "mock" ||
      process.env.AI_MODE === "mock" ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    // Resolve company settings
    const resolvedSettings: CompanySettingsForAi = {
      labor_rate: companySettings?.labor_rate ? Number(companySettings.labor_rate) : 95,
      markup_percent: companySettings?.markup_percent !== undefined ? Number(companySettings.markup_percent) : 20,
      min_margin_percent: companySettings?.min_margin_percent !== undefined ? Number(companySettings.min_margin_percent) : 25,
    };

    if (isMock) {
      // Mock mode: generate draft using client provided or starter catalog
      const resolvedCatalog =
        priceBook && priceBook.length > 0 ? priceBook : DEFAULT_PRICE_ITEMS;

      const aiDraft = await generateQuoteDraft({
        jobType: jobType as any,
        notes: notes || "",
        photos: photos || [],
        priceBook: resolvedCatalog,
        companySettings: resolvedSettings,
      });

      const totals = calculateQuoteTotals(
        aiDraft.lines,
        aiDraft.labor_hours,
        resolvedSettings
      );

      const quoteId = "quote-" + Date.now();
      const publicToken = "tok_" + crypto.randomBytes(12).toString("hex");

      const quote = {
        id: quoteId,
        job_id: jobId,
        status: "draft",
        ai_raw_output: aiDraft,
        subtotal: totals.subtotal,
        labor_total: totals.labor_total,
        total: totals.total,
        public_token: publicToken,
        created_at: new Date().toISOString(),
        totals,
        lines: aiDraft.lines.map((line, idx) => ({
          id: `line-${Date.now()}-${idx}`,
          quote_id: quoteId,
          price_item_id: line.price_item_id,
          description: line.description,
          qty: line.quantity,
          unit_price: line.unit_price,
          line_total: line.is_unpriced ? null : line.unit_price * line.quantity,
          is_ai_suggested: true,
          reason: line.reason,
          confidence: line.confidence,
        })),
      };

      return NextResponse.json({
        success: true,
        quoteId,
        quote,
      });
    }

    // Live Supabase Mode
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company ID
    const { data: profile } = await (supabase.from("profiles") as any)
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json(
        { error: "No company associated with account." },
        { status: 400 }
      );
    }

    const companyId = profile.company_id;

    // 1. Fetch Job
    const { data: job, error: jobErr } = await (supabase.from("jobs") as any)
      .select("*, customer:customers(*), photos:job_photos(*)")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json(
        { error: "Job not found." },
        { status: 404 }
      );
    }

    // 2. Fetch Company Settings
    const { data: company } = await (supabase.from("companies") as any)
      .select("labor_rate, markup_percent, min_margin_percent")
      .eq("id", companyId)
      .single();

    const liveSettings: CompanySettingsForAi = {
      labor_rate: company?.labor_rate ? Number(company.labor_rate) : 95,
      markup_percent: company?.markup_percent !== undefined ? Number(company.markup_percent) : 20,
      min_margin_percent: company?.min_margin_percent !== undefined ? Number(company.min_margin_percent) : 25,
    };

    // 3. Fetch Company Price Items
    const { data: priceItems } = await (supabase.from("price_items") as any)
      .select("id, name, category, unit, unit_price, cost")
      .eq("company_id", companyId);

    const liveCatalog: PriceItemForAi[] = (priceItems || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category || "General",
      unit: item.unit || "each",
      unit_price: Number(item.unit_price),
      cost: item.cost ? Number(item.cost) : 0,
    }));

    // 4. Download and convert photos to base64 for vision model
    const photoInputs = [];
    if (job.photos && job.photos.length > 0) {
      for (const p of job.photos) {
        if (p.storage_path) {
          const { data: photoBlob } = await supabase.storage
            .from("job-photos")
            .download(p.storage_path);

          if (photoBlob) {
            const buffer = Buffer.from(await photoBlob.arrayBuffer());
            photoInputs.push({
              base64: buffer.toString("base64"),
              mimeType: photoBlob.type || "image/jpeg",
            });
          }
        }
      }
    }

    // 5. Generate AI draft
    const aiDraft = await generateQuoteDraft({
      jobType: job.job_type,
      notes: job.notes || "",
      photos: photoInputs,
      priceBook: liveCatalog.length > 0 ? liveCatalog : DEFAULT_PRICE_ITEMS,
      companySettings: liveSettings,
    });

    // 6. Calculate Totals
    const totals = calculateQuoteTotals(
      aiDraft.lines,
      aiDraft.labor_hours,
      liveSettings
    );

    const publicToken = crypto.randomBytes(16).toString("hex");

    // 7. Insert Quote into Database
    const { data: quoteRecord, error: quoteErr } = await (supabase.from("quotes") as any)
      .insert({
        job_id: job.id,
        company_id: companyId,
        status: "draft",
        ai_raw_output: aiDraft,
        subtotal: totals.subtotal,
        labor_total: totals.labor_total,
        total: totals.total,
        public_token: publicToken,
      })
      .select()
      .single();

    if (quoteErr) throw quoteErr;

    // 8. Insert Quote Lines
    const linesToInsert = aiDraft.lines.map((l) => ({
      quote_id: quoteRecord.id,
      price_item_id: l.price_item_id,
      description: l.description,
      qty: l.quantity,
      unit_price: l.unit_price,
      line_total: l.is_unpriced ? null : l.unit_price * l.quantity,
      is_ai_suggested: true,
      reason: l.reason,
      confidence: l.confidence,
    }));

    const { data: insertedLines, error: linesErr } = await (supabase.from("quote_lines") as any)
      .insert(linesToInsert)
      .select();

    if (linesErr) throw linesErr;

    return NextResponse.json({
      success: true,
      quoteId: quoteRecord.id,
      quote: {
        ...quoteRecord,
        totals,
        lines: insertedLines,
      },
    });
  } catch (error: any) {
    console.error("Quote generation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during quote generation." },
      { status: 500 }
    );
  }
}
