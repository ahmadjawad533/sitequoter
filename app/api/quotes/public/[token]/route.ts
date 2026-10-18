import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: {
    token: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: "Missing quote token" }, { status: 400 });
  }

  const isMock =
    process.env.AUTH_MODE === "mock" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (isMock) {
    // In mock mode, the client reads directly from localStorage or returns this default sample
    return NextResponse.json({
      success: true,
      quote: {
        id: "quote-sample-1",
        public_token: token,
        status: "sent",
        company: {
          name: "Apex Heating and Air",
          phone: "(555) 123-4567",
          email: "service@apexhvac.local",
        },
        customer: {
          name: "Ahmed Khan",
          address: "12 Oak St",
          phone: "(555) 234-5678",
        },
        lines: [
          { description: "Capacitor 45/5 MFD Dual Run", qty: 1, unit_price: 38, line_total: 38 },
          { description: "Contactor 30A Single Pole", qty: 1, unit_price: 42, line_total: 42 },
        ],
        labor_total: 142.50,
        total: 266.00,
        approved_at: null,
        created_at: new Date().toISOString(),
      },
    });
  }

  try {
    const supabase = createClient();

    // Query quotes by public_token (public access)
    const { data: quote, error: quoteErr } = await (supabase.from("quotes") as any)
      .select(`
        id,
        status,
        subtotal,
        labor_total,
        total,
        public_token,
        sent_at,
        approved_at,
        created_at,
        company:companies(name, phone, email),
        job:jobs(
          job_type,
          customer:customers(name, address, phone)
        ),
        lines:quote_lines(description, qty, unit_price, line_total)
      `)
      .eq("public_token", token)
      .single();

    if (quoteErr || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // Filter customer-safe data (strip internal costs and margins)
    const publicQuote = {
      id: quote.id,
      public_token: quote.public_token,
      status: quote.status,
      company: {
        name: quote.company?.name || "HVAC Contractor",
        phone: quote.company?.phone || "",
        email: quote.company?.email || "",
      },
      customer: {
        name: quote.job?.customer?.name || "Customer",
        address: quote.job?.customer?.address || "",
        phone: quote.job?.customer?.phone || "",
      },
      job_type: quote.job?.job_type || "repair",
      lines: (quote.lines || []).map((l: any) => ({
        description: l.description,
        qty: Number(l.qty),
        unit_price: Number(l.unit_price || 0),
        line_total: Number(l.line_total || 0),
      })),
      labor_total: Number(quote.labor_total || 0),
      total: Number(quote.total || 0),
      approved_at: quote.approved_at,
      created_at: quote.created_at,
    };

    return NextResponse.json({ success: true, quote: publicQuote });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load public quote." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ error: "Missing quote token" }, { status: 400 });
  }

  const isMock =
    process.env.AUTH_MODE === "mock" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  const now = new Date().toISOString();

  if (isMock) {
    return NextResponse.json({
      success: true,
      status: "approved",
      approved_at: now,
    });
  }

  try {
    const supabase = createClient();

    // 1. Fetch quote by token
    const { data: quote, error: quoteErr } = await (supabase.from("quotes") as any)
      .select("id, job_id, status")
      .eq("public_token", token)
      .single();

    if (quoteErr || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    // 2. Update quote status to approved
    const { error: updateQuoteErr } = await (supabase.from("quotes") as any)
      .update({
        status: "approved",
        approved_at: now,
        updated_at: now,
      })
      .eq("id", quote.id);

    if (updateQuoteErr) throw updateQuoteErr;

    // 3. Update job status to approved (Won)
    if (quote.job_id) {
      await (supabase.from("jobs") as any)
        .update({
          status: "approved",
        })
        .eq("id", quote.job_id);
    }

    return NextResponse.json({
      success: true,
      status: "approved",
      approved_at: now,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to approve quote." },
      { status: 500 }
    );
  }
}
