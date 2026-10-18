"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Wrench,
  Phone,
  CheckCircle2,
  Printer,
  Download,
  ShieldCheck,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicQuoteData {
  id: string;
  public_token: string;
  status: "draft" | "sent" | "approved" | "lost";
  company: {
    name: string;
    phone: string;
    email: string;
  };
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  lines: Array<{
    description: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }>;
  labor_total: number;
  total: number;
  approved_at?: string | null;
  created_at: string;
}

export default function CustomerQuotePage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quote, setQuote] = React.useState<PublicQuoteData | null>(null);
  const [isApproving, setIsApproving] = React.useState(false);
  const [showApprovalSuccess, setShowApprovalSuccess] = React.useState(false);

  React.useEffect(() => {
    async function fetchQuote() {
      setLoading(true);
      setError(null);

      try {
        // 1. First check local storage for offline mock persistence
        let localFound: any = null;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("sitequote_quotes");
          if (stored) {
            try {
              const list = JSON.parse(stored);
              localFound = list.find(
                (q: any) => q.public_token === token || q.id === token
              );
            } catch {}
          }
        }

        if (localFound) {
          const formatted: PublicQuoteData = {
            id: localFound.id,
            public_token: localFound.public_token || token,
            status: localFound.status || "sent",
            company: {
              name: "Apex Heating and Air",
              phone: "(555) 123-4567",
              email: "service@apexhvac.com",
            },
            customer: {
              name: localFound.customerName || "Customer",
              address: localFound.customerAddress || "12 Oak St",
              phone: localFound.customerPhone || "(555) 234-5678",
            },
            lines: (localFound.lines || []).map((l: any) => ({
              description: l.description,
              qty: Number(l.qty || 1),
              unit_price: Number(l.unit_price || 0),
              line_total: Number(l.unit_price || 0) * Number(l.qty || 1),
            })),
            labor_total: Number(localFound.totals?.labor_total || localFound.labor_total || 142.5),
            total: Number(localFound.totals?.total || localFound.total || 266),
            approved_at: localFound.approved_at || null,
            created_at: localFound.created_at || new Date().toISOString(),
          };

          setQuote(formatted);
          if (formatted.status === "approved") {
            setShowApprovalSuccess(true);
          }
          return;
        }

        // 2. Fetch from public API
        const res = await fetch(`/api/quotes/public/${token}`);
        if (!res.ok) {
          throw new Error("Quote not found or invalid link.");
        }

        const data = await res.json();
        if (data.quote) {
          setQuote(data.quote);
          if (data.quote.status === "approved") {
            setShowApprovalSuccess(true);
          }
        } else {
          throw new Error("Invalid quote response.");
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load quote.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuote();
  }, [token]);

  const handleApprove = async () => {
    if (!quote || quote.status === "approved") return;
    setIsApproving(true);

    try {
      const now = new Date().toISOString();

      // Call public approval API
      const res = await fetch(`/api/quotes/public/${token}`, {
        method: "POST",
      });

      const updatedQuote: PublicQuoteData = {
        ...quote,
        status: "approved",
        approved_at: now,
      };

      setQuote(updatedQuote);
      setShowApprovalSuccess(true);

      // Also sync local storage mock jobs/quotes
      if (typeof window !== "undefined") {
        try {
          const storedQuotes = localStorage.getItem("sitequote_quotes");
          if (storedQuotes) {
            const list = JSON.parse(storedQuotes);
            const idx = list.findIndex(
              (q: any) => q.public_token === token || q.id === quote.id
            );
            if (idx >= 0) {
              list[idx].status = "approved";
              list[idx].approved_at = now;
              localStorage.setItem("sitequote_quotes", JSON.stringify(list));
            }
          }

          const storedJobs = localStorage.getItem("sitequote_jobs");
          if (storedJobs) {
            const jobs = JSON.parse(storedJobs);
            const jIdx = jobs.findIndex(
              (j: any) => j.id === quote.id || j.quote?.id === quote.id
            );
            if (jIdx >= 0) {
              jobs[jIdx].status = "approved";
              if (jobs[jIdx].quote) {
                jobs[jIdx].quote.status = "approved";
                jobs[jIdx].quote.approved_at = now;
              }
              localStorage.setItem("sitequote_jobs", JSON.stringify(jobs));
            }
          }
        } catch {}
      }
    } catch (err: any) {
      alert("Failed to approve quote: " + err?.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 border border-[#E5E7EB] space-y-4 animate-pulse">
          <div className="h-6 bg-[#E5E7EB] rounded w-1/3" />
          <div className="h-4 bg-[#F3F4F6] rounded w-1/2" />
          <div className="h-40 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]" />
          <div className="h-12 bg-[#F3F4F6] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 border border-[#E5E7EB] text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-[#111827]">Quote Not Found</h2>
          <p className="text-sm text-[#4B5563]">
            {error || "The quote link is expired, invalid, or no longer available."}
          </p>
        </div>
      </div>
    );
  }

  const isApproved = quote.status === "approved";

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-6 px-3 sm:px-6">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Main Printable Quote Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Company Branding & Header */}
          <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">
                  <Wrench className="h-5 w-5" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#111827]">
                  {quote.company.name}
                </h1>
              </div>
              <p className="text-xs text-[#6B7280]">
                Licensed & Insured Residential HVAC Services
              </p>
            </div>

            {quote.company.phone && (
              <a
                href={`tel:${quote.company.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline shrink-0"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{quote.company.phone}</span>
              </a>
            )}
          </div>

          {/* Customer & Quote Details */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Quote Prepared For
              </p>
              <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                {quote.customer.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563]">
                {quote.customer.address}
              </p>
            </div>

            <div className="text-right space-y-1">
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                  isApproved
                    ? "bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]"
                    : "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]"
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approved
                  </>
                ) : (
                  "Pending Approval"
                )}
              </span>
              <p className="text-[11px] text-[#9CA3AF]">
                {new Date(quote.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Approval Success Banner */}
          {showApprovalSuccess && (
            <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-[#166534] space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>Quote Approved!</span>
              </div>
              <p className="text-xs text-[#15803D] leading-relaxed">
                Thank you! Your quote approval has been recorded. Our team will contact you shortly to schedule your service.
              </p>
              {quote.approved_at && (
                <p className="text-[11px] text-[#166534]/80 pt-1">
                  Confirmed on {new Date(quote.approved_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Line Items Breakdown (Wireframe Screen 5) */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Service & Materials Breakdown
            </h3>

            <div className="divide-y divide-[#F3F4F6] border-y border-[#E5E7EB]">
              {quote.lines.map((line, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between gap-3 text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#111827]">
                      {line.description}
                    </p>
                    {line.qty > 1 && (
                      <p className="text-xs text-[#6B7280]">
                        Qty: {line.qty} @ ${line.unit_price} each
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#111827] shrink-0">
                    ${(line.line_total || line.unit_price * line.qty).toFixed(0)}
                  </span>
                </div>
              ))}

              {/* Labor row */}
              <div className="py-3 flex items-center justify-between gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#111827]">
                    Labor & Installation
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Certified technician service and diagnostics
                  </p>
                </div>
                <span className="font-semibold text-[#111827] shrink-0">
                  ${quote.labor_total.toFixed(0)}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="pt-2 flex items-center justify-between text-base sm:text-lg font-bold text-[#111827]">
              <span>TOTAL</span>
              <span>${quote.total.toFixed(0)}</span>
            </div>
          </div>

          {/* Terms notice */}
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-xs text-[#6B7280] space-y-1">
            <p className="font-medium text-[#374151]">Service Guarantee:</p>
            <p className="leading-relaxed">
              All parts and craftsmanship are backed by our 1-year service warranty. Estimates are valid for 30 days from issuance.
            </p>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="space-y-2.5 pt-2 print:hidden">
            {!isApproved ? (
              <Button
                type="button"
                disabled={isApproving}
                onClick={handleApprove}
                className="w-full min-h-[52px] rounded-xl bg-[#16A34A] text-white hover:bg-[#15803D] text-base font-semibold shadow-none flex items-center justify-center gap-2"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirming approval...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>Approve this quote</span>
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Quote already approved</span>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="w-full min-h-[44px] rounded-xl border-[#D1D5DB] text-[#374151] hover:bg-[#F3F4F6] text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download / Print PDF</span>
            </Button>
          </div>

          {/* Footer Contact */}
          <div className="pt-4 border-t border-[#F3F4F6] text-center space-y-1">
            <p className="text-xs font-semibold text-[#111827]">
              Questions about this quote?
            </p>
            {quote.company.phone ? (
              <p className="text-xs text-[#4B5563]">
                Call us at{" "}
                <a
                  href={`tel:${quote.company.phone.replace(/\D/g, "")}`}
                  className="font-bold text-[#1D4ED8] hover:underline"
                >
                  {quote.company.phone}
                </a>
              </p>
            ) : (
              <p className="text-xs text-[#6B7280]">
                Contact your service technician directly.
              </p>
            )}
          </div>
        </div>

        {/* Small branding footer */}
        <p className="text-center text-[11px] text-[#9CA3AF] print:hidden">
          Delivered securely via SiteQuote · Fast, honest HVAC quotes
        </p>
      </div>
    </div>
  );
}
