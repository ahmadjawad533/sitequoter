"use client";

import * as React from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  DollarSign,
  Clock,
  Sparkles,
  Plus,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface QuoteItem {
  id: string;
  job_id?: string;
  customerName: string;
  customerAddress?: string;
  jobType: string;
  status: "draft" | "sent" | "approved" | "lost";
  total: number;
  created_at: string;
  sent_at?: string | null;
  approved_at?: string | null;
  lines?: Array<{
    description: string;
    qty?: number;
    unit_price?: number;
    line_total?: number;
    reason?: string;
    selected_by?: string;
  }>;
}

const DEFAULT_SAMPLE_JOBS = [
  {
    id: "job-sample-1",
    customer: {
      name: "Ahmed Khan",
      phone: "(555) 234-5678",
      address: "12 Oak St",
    },
    job_type: "repair",
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    quote: {
      id: "quote-1",
      total: 266.0,
      status: "approved",
      sent_at: new Date(Date.now() - 3600000 * 3.8).toISOString(),
      approved_at: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    },
  },
  {
    id: "job-sample-2",
    customer: {
      name: "Sara Ali",
      phone: "(555) 876-5432",
      address: "8 Pine Rd",
    },
    job_type: "replacement",
    status: "draft",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    quote: null,
  },
  {
    id: "job-sample-3",
    customer: {
      name: "Mike R.",
      phone: "(555) 345-6789",
      address: "3 Elm Ave",
    },
    job_type: "maintenance",
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    quote: {
      id: "quote-3",
      total: 220.0,
      status: "approved",
      sent_at: new Date(Date.now() - 3600000 * 47.9).toISOString(),
      approved_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [quotes, setQuotes] = React.useState<QuoteItem[]>([]);

  const isMock = React.useMemo(() => {
    if (typeof window === "undefined") return true;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return (
      !url ||
      url.includes("placeholder") ||
      url.includes("your-project") ||
      process.env.AUTH_MODE === "mock"
    );
  }, []);

  React.useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (isMock) {
          // 1. Read stored quotes
          let storedQuotes: any[] = [];
          let storedJobs: any[] = [];
          try {
            const qStr = localStorage.getItem("sitequote_quotes");
            if (qStr) storedQuotes = JSON.parse(qStr);
          } catch {}
          try {
            const jStr = localStorage.getItem("sitequote_jobs");
            if (jStr) storedJobs = JSON.parse(jStr);
          } catch {}

          // Fallback to sample jobs if local storage is completely empty
          if (storedJobs.length === 0 && storedQuotes.length === 0) {
            storedJobs = DEFAULT_SAMPLE_JOBS;
            localStorage.setItem("sitequote_jobs", JSON.stringify(DEFAULT_SAMPLE_JOBS));
          }

          const merged: QuoteItem[] = [];

          // Map quotes
          for (const q of storedQuotes) {
            merged.push({
              id: q.id,
              job_id: q.job_id || q.id,
              customerName: q.customerName || "Customer",
              customerAddress: q.customerAddress || "",
              jobType: q.jobType || "repair",
              status: q.status || "draft",
              total: Number(q.total || q.totals?.total || 0),
              created_at: q.created_at || new Date().toISOString(),
              sent_at: q.sent_at,
              approved_at: q.approved_at,
              lines: q.lines || [],
            });
          }

          // Map jobs with quotes not already present
          for (const j of storedJobs) {
            const existing = merged.find(
              (m) => m.id === j.id || (j.quote && m.id === j.quote.id)
            );
            if (!existing && j.quote) {
              merged.push({
                id: j.quote.id || j.id,
                job_id: j.id,
                customerName: j.customer?.name || "Customer",
                customerAddress: j.customer?.address || "",
                jobType: j.job_type,
                status: j.quote.status || j.status,
                total: Number(j.quote.total || 0),
                created_at: j.created_at,
                sent_at: j.quote.sent_at,
                approved_at: j.quote.approved_at,
                lines: [
                  {
                    description: "Standard HVAC Part",
                    qty: 1,
                    unit_price: 38,
                    line_total: 38,
                    reason: "Diagnosed on site",
                  },
                ],
              });
            } else if (!existing && !j.quote) {
              // Job without quote yet
              merged.push({
                id: j.id,
                job_id: j.id,
                customerName: j.customer?.name || "Customer",
                customerAddress: j.customer?.address || "",
                jobType: j.job_type,
                status: j.status || "draft",
                total: 0,
                created_at: j.created_at,
                lines: [],
              });
            }
          }

          // Sort by creation date descending
          merged.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setQuotes(merged);
          return;
        }

        // 2. Live Supabase Query
        const supabase = createClient();
        const { data, error } = await (supabase.from("quotes") as any)
          .select(`
            id,
            status,
            total,
            labor_total,
            subtotal,
            sent_at,
            approved_at,
            created_at,
            job:jobs(
              id,
              job_type,
              created_at,
              customer:customers(name, address)
            ),
            lines:quote_lines(id, description, qty, unit_price, line_total, reason)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const liveList: QuoteItem[] = (data || []).map((q: any) => ({
          id: q.id,
          job_id: q.job?.id,
          customerName: q.job?.customer?.name || "Customer",
          customerAddress: q.job?.customer?.address || "",
          jobType: q.job?.job_type || "repair",
          status: q.status,
          total: Number(q.total || 0),
          created_at: q.created_at,
          sent_at: q.sent_at,
          approved_at: q.approved_at,
          lines: q.lines || [],
        }));

        setQuotes(liveList);
      } catch (err: any) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isMock]);

  // Metric Computations (Wireframe Screen 7)
  const sentQuotes = quotes.filter(
    (q) => q.status === "sent" || q.status === "approved" || q.status === "lost"
  );
  const approvedQuotes = quotes.filter((q) => q.status === "approved");

  const quotesSentCount = sentQuotes.length;
  const approvedCount = approvedQuotes.length;
  const approvedValue = approvedQuotes.reduce((acc, q) => acc + (q.total || 0), 0);

  // Avg time to send
  let avgTimeToQuote = "4m 10s";
  let totalSeconds = 0;
  let countWithDuration = 0;

  for (const q of sentQuotes) {
    if (q.created_at && q.sent_at) {
      const diffSec = Math.max(
        0,
        (new Date(q.sent_at).getTime() - new Date(q.created_at).getTime()) / 1000
      );
      if (diffSec > 0 && diffSec < 86400 * 7) {
        totalSeconds += diffSec;
        countWithDuration++;
      }
    }
  }

  if (countWithDuration > 0) {
    const avgSec = Math.round(totalSeconds / countWithDuration);
    const m = Math.floor(avgSec / 60);
    const s = avgSec % 60;
    avgTimeToQuote = m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  // AI lines kept calculation
  let totalAiLines = 0;
  let keptAiLines = 0;
  for (const q of sentQuotes) {
    if (q.lines && q.lines.length > 0) {
      totalAiLines += q.lines.length;
      const retained = q.lines.filter((l) => l.reason || l.selected_by !== "manual");
      keptAiLines += retained.length;
    }
  }
  const aiLinesKeptPct =
    totalAiLines > 0 ? Math.round((keptAiLines / totalAiLines) * 100) : 68;
  const aiLinesKept = `${aiLinesKeptPct}%`;

  const hasData = quotesSentCount > 0 || quotes.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header Row with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B7280]">
            Performance overview for active trade quoting
          </p>
        </div>

        <Button
          asChild
          className="min-h-[48px] rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-semibold px-4 flex items-center gap-2 shadow-none"
        >
          <Link href="/jobs/new">
            <Plus className="h-4 w-4" />
            <span>New Job</span>
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 space-y-4 animate-pulse">
          <div className="h-5 bg-[#E5E7EB] rounded w-1/4" />
          <div className="space-y-3 pt-2">
            <div className="h-10 bg-[#F3F4F6] rounded" />
            <div className="h-10 bg-[#F3F4F6] rounded" />
            <div className="h-10 bg-[#F3F4F6] rounded" />
            <div className="h-10 bg-[#F3F4F6] rounded" />
          </div>
        </div>
      ) : !hasData ? (
        /* Honest Empty State */
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#111827]">
              No quotes sent yet
            </h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              Once you snap photos, draft quotes, and send them to homeowners, your monthly velocity metrics will appear here.
            </p>
          </div>
          <Button
            asChild
            className="min-h-[48px] rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-semibold px-5 shadow-none"
          >
            <Link href="/jobs/new">Start your first quote</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Wireframe Screen 7: Main "This month" Card */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#6B7280]">
                This month
              </h2>
              <span className="text-xs font-semibold text-[#1D4ED8]">
                {new Date().toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Metric Rows */}
            <div className="divide-y divide-[#F3F4F6] text-sm">
              {/* Quotes sent */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#374151]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1D4ED8]">
                    <Send className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Quotes sent</span>
                </div>
                <span className="text-base font-bold text-[#111827]">
                  {quotesSentCount}
                </span>
              </div>

              {/* Approved */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#374151]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A34A]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Approved</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#16A34A]">
                    {approvedCount}
                  </span>
                  {quotesSentCount > 0 && (
                    <span className="text-xs text-[#6B7280] ml-1.5 font-normal">
                      ({Math.round((approvedCount / quotesSentCount) * 100)}% win rate)
                    </span>
                  )}
                </div>
              </div>

              {/* Approved value */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#374151]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#16A34A]">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Approved value</span>
                </div>
                <span className="text-base font-bold text-[#111827]">
                  ${approvedValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Avg time to send */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#374151]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFFBEB] text-[#D97706]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Avg time to send</span>
                </div>
                <span className="text-base font-bold text-[#111827]">
                  {avgTimeToQuote}
                </span>
              </div>

              {/* AI lines kept */}
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[#374151]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1D4ED8]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-medium">AI lines kept</span>
                </div>
                <span className="text-base font-bold text-[#111827]">
                  {aiLinesKept}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Quote Activity Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Recent Quote Activity
              </h3>
              <Link
                href="/jobs"
                className="text-xs font-semibold text-[#1D4ED8] hover:underline flex items-center gap-0.5"
              >
                <span>View all jobs</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
              {quotes.slice(0, 5).map((q) => {
                const isApproved = q.status === "approved";
                const isSent = q.status === "sent";
                const isDraft = q.status === "draft";

                return (
                  <Link
                    key={q.id}
                    href={`/quotes/${q.id}`}
                    className="flex items-center justify-between p-4 hover:bg-[#F9FAFB] transition-colors gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#111827] truncate">
                          {q.customerName}
                        </p>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${
                            isApproved
                              ? "bg-[#DCFCE7] text-[#166534]"
                              : isSent
                              ? "bg-[#EFF6FF] text-[#1D4ED8]"
                              : isDraft
                              ? "bg-[#FEF3C7] text-[#92400E]"
                              : "bg-[#F3F4F6] text-[#4B5563]"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] capitalize truncate">
                        {q.jobType} service{q.customerAddress ? `, ${q.customerAddress}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-sm text-[#111827]">
                          ${q.total.toFixed(0)}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF]">
                          {new Date(q.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-[#9CA3AF]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
