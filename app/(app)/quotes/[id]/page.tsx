"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Send,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditLineDialog } from "@/components/quotes/EditLineDialog";
import { AddQuoteLineDialog } from "@/components/quotes/AddQuoteLineDialog";
import { calculateQuoteTotals } from "@/lib/ai/calculator";
import {
  AiQuoteDraftOutput,
  PriceItemForAi,
  CompanySettingsForAi,
  CalculatedQuoteSummary,
} from "@/lib/ai/schemas";

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

interface QuoteLineItem {
  id: string;
  price_item_id: string | null;
  description: string;
  qty: number;
  unit_price: number | null;
  line_total: number | null;
  is_unpriced?: boolean;
  reason?: string;
  confidence?: "low" | "medium" | "high";
}

interface QuoteDetails {
  id: string;
  job_id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  jobType: string;
  status: "draft" | "sent" | "approved" | "lost";
  public_token: string;
  ai_raw_output: AiQuoteDraftOutput;
  lines: QuoteLineItem[];
  labor_hours: number;
  companySettings: CompanySettingsForAi;
  totals: CalculatedQuoteSummary;
}

export default function QuoteReviewPage() {
  const params = useParams();
  const quoteIdOrJobId = params?.id as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quote, setQuote] = React.useState<QuoteDetails | null>(null);

  // Price book catalog for "+ Add item" modal
  const [priceBook, setPriceBook] = React.useState<PriceItemForAi[]>(DEFAULT_PRICE_ITEMS);

  // Dialog states
  const [editingLine, setEditingLine] = React.useState<QuoteLineItem | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Track expanded "why?" disclosures
  const [expandedReasons, setExpandedReasons] = React.useState<Record<string, boolean>>({});

  // Sent state & link copying
  const [isSending, setIsSending] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [sentSuccessNotice, setSentSuccessNotice] = React.useState(false);

  // Load quote details
  React.useEffect(() => {
    async function loadQuote() {
      setLoading(true);
      setError(null);

      try {
        // Load company price book from local storage or starter
        const storedPrices = localStorage.getItem("sitequote_price_book");
        if (storedPrices) {
          try {
            const parsed = JSON.parse(storedPrices);
            setPriceBook(parsed.length > 0 ? parsed : DEFAULT_PRICE_ITEMS);
          } catch {
            setPriceBook(DEFAULT_PRICE_ITEMS);
          }
        } else {
          setPriceBook(DEFAULT_PRICE_ITEMS);
        }

        // Check local mock storage for existing quotes
        const storedQuotes = localStorage.getItem("sitequote_quotes");
        let foundQuote: any = null;

        if (storedQuotes) {
          try {
            const list = JSON.parse(storedQuotes);
            foundQuote = list.find(
              (q: any) => q.id === quoteIdOrJobId || q.job_id === quoteIdOrJobId
            );
          } catch {}
        }

        // If not found in sitequote_quotes, look in sitequote_jobs
        if (!foundQuote) {
          const storedJobs = localStorage.getItem("sitequote_jobs");
          if (storedJobs) {
            try {
              const jobs = JSON.parse(storedJobs);
              const matchedJob = jobs.find(
                (j: any) => j.id === quoteIdOrJobId || j.quote?.id === quoteIdOrJobId
              );

              if (matchedJob) {
                // If job exists but quote not drafted yet, generate one via API
                const genRes = await fetch("/api/quotes/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    jobId: matchedJob.id,
                    jobType: matchedJob.job_type,
                    notes: matchedJob.notes,
                    companySettings: { labor_rate: 95, markup_percent: 20, min_margin_percent: 25 },
                  }),
                });

                if (genRes.ok) {
                  const genData = await genRes.json();
                  foundQuote = genData.quote;
                  foundQuote.customerName = matchedJob.customer?.name || "Customer";
                  foundQuote.customerPhone = matchedJob.customer?.phone;
                  foundQuote.customerAddress = matchedJob.customer?.address;
                  foundQuote.jobType = matchedJob.job_type;
                }
              }
            } catch {}
          }
        }

        // If still not found, fetch or mock standard sample
        if (!foundQuote) {
          // Generate sample quote for preview
          const sampleAiDraft: AiQuoteDraftOutput = {
            summary: "Diagnostic found run capacitor and contactor failure on outdoor condenser.",
            labor_hours: 1.5,
            labor_reason: "1.5 hours: Perform diagnostic testing, discharge capacitor, install replacement 45/5 MFD capacitor and 30A contactor, and verify amp draw.",
            questions: [
              "Confirm whether the outdoor unit operates on R-410A or R-22.",
              "Is the outdoor disconnect switch in good condition?",
            ],
            lines: [
              {
                price_item_id: "pi-cap-1",
                description: "Capacitor 45/5 MFD Dual Run",
                quantity: 1,
                unit_price: 38,
                cost: 14,
                is_unpriced: false,
                reason: "Microfarad reading tested 24% below rated tolerance.",
                confidence: "high",
              },
              {
                price_item_id: "pi-con-1",
                description: "Contactor 30A Single Pole",
                quantity: 1,
                unit_price: 42,
                cost: 16,
                is_unpriced: false,
                reason: "Severe electrical pitting observed on switch contacts.",
                confidence: "high",
              },
              {
                price_item_id: null,
                description: "R-410A Refrigerant (per lb)",
                quantity: 1,
                unit_price: 0,
                cost: 0,
                is_unpriced: true,
                reason: "Suction pressure low. Requires technician to check subcooling and price refrigerant.",
                confidence: "medium",
              },
            ],
          };

          const settings: CompanySettingsForAi = {
            labor_rate: 95,
            markup_percent: 20,
            min_margin_percent: 25,
          };

          const totals = calculateQuoteTotals(
            sampleAiDraft.lines,
            sampleAiDraft.labor_hours,
            settings
          );

          foundQuote = {
            id: quoteIdOrJobId || "quote-demo",
            job_id: "job-sample-1",
            customerName: "Ahmed Khan",
            customerPhone: "(555) 234-5678",
            customerAddress: "12 Oak St",
            jobType: "repair",
            status: "draft",
            public_token: "tok_sample_demo_123",
            ai_raw_output: sampleAiDraft,
            labor_hours: sampleAiDraft.labor_hours,
            companySettings: settings,
            totals,
            lines: sampleAiDraft.lines.map((l, idx) => ({
              id: `line-${idx}`,
              price_item_id: l.price_item_id,
              description: l.description,
              qty: l.quantity,
              unit_price: l.unit_price,
              line_total: l.is_unpriced ? null : l.unit_price * l.quantity,
              is_unpriced: l.is_unpriced,
              reason: l.reason,
              confidence: l.confidence,
            })),
          };
        }

        // Ensure totals & lines are formatted
        const settings = foundQuote.companySettings || {
          labor_rate: 95,
          markup_percent: 20,
          min_margin_percent: 25,
        };

        const lines: QuoteLineItem[] = (foundQuote.lines || []).map((l: any, idx: number) => ({
          id: l.id || `line-${idx}`,
          price_item_id: l.price_item_id || null,
          description: l.description,
          qty: Number(l.qty || l.quantity || 1),
          unit_price: l.unit_price !== null && l.unit_price !== undefined ? Number(l.unit_price) : 0,
          line_total: l.unit_price !== null && l.unit_price !== undefined ? Number(l.unit_price) * Number(l.qty || 1) : null,
          is_unpriced: Boolean(l.is_unpriced || l.unit_price === 0 || l.unit_price === null),
          reason: l.reason || "",
          confidence: l.confidence || "high",
        }));

        const laborHours = Number(foundQuote.labor_hours || foundQuote.ai_raw_output?.labor_hours || 1.5);

        const totals = calculateQuoteTotals(
          lines.map((l) => ({
            price_item_id: l.price_item_id,
            description: l.description,
            quantity: l.qty,
            unit_price: l.unit_price || 0,
            cost: (l.unit_price || 0) * 0.5,
            is_unpriced: Boolean(l.is_unpriced),
            reason: l.reason || "",
            confidence: l.confidence || "high",
          })),
          laborHours,
          settings
        );

        setQuote({
          id: foundQuote.id,
          job_id: foundQuote.job_id || "job-1",
          customerName: foundQuote.customerName || foundQuote.customer?.name || "Customer",
          customerPhone: foundQuote.customerPhone || foundQuote.customer?.phone,
          customerAddress: foundQuote.customerAddress || foundQuote.customer?.address,
          jobType: foundQuote.jobType || foundQuote.job_type || "repair",
          status: foundQuote.status || "draft",
          public_token: foundQuote.public_token || "tok_" + Math.random().toString(36).substring(2),
          ai_raw_output: foundQuote.ai_raw_output,
          lines,
          labor_hours: laborHours,
          companySettings: settings,
          totals,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to load quote details.");
      } finally {
        setLoading(false);
      }
    }

    loadQuote();
  }, [quoteIdOrJobId]);

  // Recalculate totals helper
  const updateQuoteState = (
    updatedLines: QuoteLineItem[],
    updatedLaborHours: number
  ) => {
    if (!quote) return;

    const totals = calculateQuoteTotals(
      updatedLines.map((l) => ({
        price_item_id: l.price_item_id,
        description: l.description,
        quantity: l.qty,
        unit_price: l.unit_price || 0,
        cost: (l.unit_price || 0) * 0.5,
        is_unpriced: Boolean(l.is_unpriced),
        reason: l.reason || "",
        confidence: l.confidence || "high",
      })),
      updatedLaborHours,
      quote.companySettings
    );

    const updatedQuote: QuoteDetails = {
      ...quote,
      lines: updatedLines,
      labor_hours: updatedLaborHours,
      totals,
    };

    setQuote(updatedQuote);

    // Save to local storage for persistence across reloads
    try {
      const stored = localStorage.getItem("sitequote_quotes");
      const list = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex((q: any) => q.id === quote.id);
      if (idx >= 0) {
        list[idx] = updatedQuote;
      } else {
        list.push(updatedQuote);
      }
      localStorage.setItem("sitequote_quotes", JSON.stringify(list));
    } catch {}
  };

  const toggleWhy = (lineId: string) => {
    setExpandedReasons((prev) => ({
      ...prev,
      [lineId]: !prev[lineId],
    }));
  };

  const handleEditLine = (
    lineId: string,
    updated: { description: string; qty: number; unit_price: number }
  ) => {
    if (!quote) return;
    const updatedLines = quote.lines.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          description: updated.description,
          qty: updated.qty,
          unit_price: updated.unit_price,
          line_total: updated.unit_price * updated.qty,
          is_unpriced: updated.unit_price === 0,
        };
      }
      return line;
    });

    updateQuoteState(updatedLines, quote.labor_hours);
  };

  const handleDeleteLine = (lineId: string) => {
    if (!quote) return;
    const updatedLines = quote.lines.filter((line) => line.id !== lineId);
    updateQuoteState(updatedLines, quote.labor_hours);
  };

  const handleAddLine = (item: {
    price_item_id: string | null;
    description: string;
    qty: number;
    unit_price: number;
    cost?: number;
  }) => {
    if (!quote) return;
    const newLine: QuoteLineItem = {
      id: `line-${Date.now()}`,
      price_item_id: item.price_item_id,
      description: item.description,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.unit_price * item.qty,
      is_unpriced: item.unit_price === 0,
      reason: "Technician added item during quote review.",
      confidence: "high",
    };

    updateQuoteState([...quote.lines, newLine], quote.labor_hours);
  };

  const handleLaborHoursChange = (newHours: number) => {
    if (!quote || newHours < 0.25) return;
    updateQuoteState(quote.lines, newHours);
  };

  const handleCopyLink = () => {
    if (!quote) return;
    const url = typeof window !== "undefined" ? `${window.location.origin}/q/${quote.public_token}` : `/q/${quote.public_token}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendQuote = async () => {
    if (!quote) return;
    setIsSending(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const updatedQuote: QuoteDetails = {
        ...quote,
        status: "sent",
      };
      setQuote(updatedQuote);
      setSentSuccessNotice(true);

      // Update in jobs list if matching job exists
      try {
        const storedJobs = localStorage.getItem("sitequote_jobs");
        if (storedJobs) {
          const jobs = JSON.parse(storedJobs);
          const idx = jobs.findIndex(
            (j: any) => j.id === quote.job_id || j.quote?.id === quote.id
          );
          if (idx >= 0) {
            jobs[idx].status = "sent";
            jobs[idx].quote = {
              id: quote.id,
              total: quote.totals.total,
              status: "sent",
              sent_at: new Date().toISOString(),
            };
            localStorage.setItem("sitequote_jobs", JSON.stringify(jobs));
          }
        }
      } catch {}
    } catch (err: any) {
      alert("Failed to send quote: " + err?.message);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-4 py-8 animate-pulse">
        <div className="h-8 bg-[#E5E7EB] rounded-xl w-1/2" />
        <div className="h-4 bg-[#F3F4F6] rounded-md w-1/3" />
        <div className="h-48 bg-white border border-[#E5E7EB] rounded-2xl" />
        <div className="h-32 bg-white border border-[#E5E7EB] rounded-2xl" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]">
        <h2 className="font-bold text-base mb-1">Quote Error</h2>
        <p className="text-sm mb-4">{error || "Quote not found."}</p>
        <Button asChild variant="outline">
          <Link href="/jobs">Return to Jobs</Link>
        </Button>
      </div>
    );
  }

  const { totals } = quote;

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-16">
      {/* Top Header matching Wireframe Screen 4 */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-xl text-[#374151] hover:bg-[#F3F4F6]"
          >
            <Link href="/jobs" aria-label="Back to jobs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">
              Quote - {quote.customerName}
            </h1>
            <p className="text-xs text-[#6B7280]">
              {quote.status === "sent" ? "Sent to customer" : "AI draft - please review"}
            </p>
          </div>
        </div>

        {quote.status === "sent" && (
          <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sent
          </span>
        )}
      </div>

      {/* Sent confirmation notification banner */}
      {sentSuccessNotice && (
        <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-[#166534] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Quote marked as Sent to {quote.customerName}</span>
          </div>
          <p className="text-xs text-[#15803D]">
            The customer quote link has been generated. You can copy the link below or view the customer page.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCopyLink}
              className="bg-[#166534] text-white hover:bg-[#14532D] text-xs h-8 rounded-lg flex items-center gap-1"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Copied!" : "Copy customer link"}</span>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-8 text-xs rounded-lg border-[#BBF7D0] bg-white text-[#166534] hover:bg-[#F0FDF4]"
            >
              <Link href={`/q/${quote.public_token}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View customer page
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Main Items Card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4B5563]">
            Items ({quote.lines.length})
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-8 rounded-lg text-xs font-semibold text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#EFF6FF]"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add item
          </Button>
        </div>

        {quote.lines.length === 0 ? (
          <div className="text-center py-6 text-sm text-[#6B7280] border border-dashed rounded-xl">
            No items in quote. Tap &quot;Add item&quot; to include parts.
          </div>
        ) : (
          <div className="space-y-3">
            {quote.lines.map((line) => {
              const isWhyOpen = expandedReasons[line.id];

              if (line.is_unpriced) {
                // Wireframe: (!) Unpriced: refrigerant [add price]
                return (
                  <div
                    key={line.id}
                    className="rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#92400E]">
                            Unpriced: {line.description}
                          </p>
                          {line.reason && (
                            <p className="text-xs text-[#B45309] mt-0.5">
                              {line.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => setEditingLine(line)}
                          className="h-8 bg-[#D97706] text-white hover:bg-[#B45309] text-xs font-semibold rounded-lg px-2.5"
                        >
                          Add price
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLine(line.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-[#92400E] hover:bg-[#FEF3C7]"
                          aria-label={`Remove unpriced ${line.description}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard priced item row matching Wireframe:
              // Capacitor 45/5 MFD x1
              //   $38 [why?] [edit][x]
              return (
                <div
                  key={line.id}
                  className="rounded-xl border border-[#E5E7EB] p-3 bg-white hover:border-[#D1D5DB] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold text-[#111827]">
                        {line.description} <span className="text-[#6B7280] font-normal">x{line.qty}</span>
                      </h3>
                      <p className="text-base font-bold text-[#111827]">
                        ${((line.unit_price || 0) * (line.qty || 1)).toFixed(0)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* [why?] disclosure button */}
                      {line.reason && (
                        <button
                          type="button"
                          onClick={() => toggleWhy(line.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
                          aria-expanded={isWhyOpen}
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>why?</span>
                          {isWhyOpen ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      )}

                      {/* [edit] button */}
                      <button
                        type="button"
                        onClick={() => setEditingLine(line)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-[#4B5563] hover:bg-[#F3F4F6] transition-colors"
                        aria-label={`Edit ${line.description}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {/* [x] delete button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLine(line.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-[#4B5563] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                        aria-label={`Delete ${line.description}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* AI reason disclosure */}
                  {isWhyOpen && line.reason && (
                    <div className="rounded-lg bg-[#F9FAFB] p-2.5 text-xs text-[#374151] border border-[#E5E7EB] space-y-1">
                      <p className="font-medium text-[#111827]">AI Rationale:</p>
                      <p className="leading-relaxed">{line.reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Labor Row: Labor 1.5 h @ $95  $142 */}
        <div className="pt-3 border-t border-[#F3F4F6] space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-[#111827]">Labor</span>
              <p className="text-xs text-[#6B7280]">
                {quote.labor_hours} h @ ${totals.labor_rate}/hr
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Stepper controls for technician */}
              <div className="flex items-center border border-[#E5E7EB] rounded-lg overflow-hidden bg-[#F9FAFB]">
                <button
                  type="button"
                  onClick={() => handleLaborHoursChange(quote.labor_hours - 0.5)}
                  disabled={quote.labor_hours <= 0.5}
                  className="px-2.5 py-1 text-sm font-bold text-[#374151] hover:bg-[#E5E7EB] disabled:opacity-30"
                  aria-label="Decrease labor hours by 0.5"
                >
                  -
                </button>
                <span className="px-2 text-xs font-semibold text-[#111827]">
                  {quote.labor_hours}h
                </span>
                <button
                  type="button"
                  onClick={() => handleLaborHoursChange(quote.labor_hours + 0.5)}
                  className="px-2.5 py-1 text-sm font-bold text-[#374151] hover:bg-[#E5E7EB]"
                  aria-label="Increase labor hours by 0.5"
                >
                  +
                </button>
              </div>

              <span className="text-base font-bold text-[#111827]">
                ${totals.labor_total.toFixed(0)}
              </span>
            </div>
          </div>

          {quote.ai_raw_output?.labor_reason && (
            <p className="text-xs text-[#6B7280] italic leading-relaxed">
              &quot;{quote.ai_raw_output.labor_reason}&quot;
            </p>
          )}
        </div>

        {/* Financial Totals: Subtotal, Markup, TOTAL */}
        <div className="pt-3 border-t border-[#E5E7EB] space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#4B5563]">
            <span>Subtotal</span>
            <span>${totals.subtotal.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-[#4B5563]">
            <span>Markup {totals.markup_percent}%</span>
            <span>${totals.markup_total.toFixed(0)}</span>
          </div>

          <div className="flex items-center justify-between text-lg font-bold text-[#111827] pt-2 border-t border-[#F3F4F6]">
            <span>TOTAL</span>
            <span>${totals.total.toFixed(0)}</span>
          </div>

          {/* Margin Status Badge & Warning Rule */}
          <div className="pt-2">
            {totals.is_margin_below_minimum ? (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  Margin WARNING: {totals.margin_percent}% is below company minimum ({totals.min_margin_percent}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] text-[#166534] text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Margin OK ({totals.margin_percent}%) · Above {totals.min_margin_percent}% minimum
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions from AI Card */}
      {quote.ai_raw_output?.questions && quote.ai_raw_output.questions.length > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
            <HelpCircle className="h-4 w-4 text-[#1D4ED8]" />
            <span>Questions from AI:</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-[#374151]">
            {quote.ai_raw_output.questions.map((q, idx) => (
              <li key={idx} className="leading-relaxed">
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <Button
          type="button"
          disabled={isSending || quote.lines.length === 0}
          onClick={handleSendQuote}
          className="w-full min-h-[52px] rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] text-base font-semibold shadow-none flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Sending quote...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>{quote.status === "sent" ? "Resend or Update Quote" : "Send quote"}</span>
            </>
          )}
        </Button>

        {quote.status === "sent" && (
          <div className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs">
            <span className="text-[#4B5563] truncate mr-2">Link: /q/{quote.public_token}</span>
            <div className="flex gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-7 text-xs rounded-lg px-2"
              >
                {copiedLink ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-lg px-2"
              >
                <Link href={`/q/${quote.public_token}`} target="_blank">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditLineDialog
        isOpen={Boolean(editingLine)}
        onClose={() => setEditingLine(null)}
        line={editingLine}
        onSave={handleEditLine}
      />

      <AddQuoteLineDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        priceBook={priceBook}
        onAdd={handleAddLine}
      />
    </div>
  );
}
