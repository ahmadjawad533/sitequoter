"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Briefcase, Camera, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs, Job } from "@/hooks/useJobs";

function JobsContent() {
  const searchParams = useSearchParams();
  const createdId = searchParams.get("created");

  const {
    jobs,
    filteredJobs,
    statusFilter,
    setStatusFilter,
    loading,
    error,
  } = useJobs();

  const getStatusBadge = (status: Job["status"]) => {
    switch (status) {
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]">
            <Clock className="h-3 w-3" />
            Draft
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            Sent
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
            <CheckCircle2 className="h-3 w-3" />
            Won
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
            Lost
          </span>
        );
      default:
        return null;
    }
  };

  const getJobTypeLabel = (type: Job["job_type"]) => {
    switch (type) {
      case "repair":
        return "AC / Heating repair";
      case "replacement":
        return "System replacement";
      case "maintenance":
        return "Maintenance tune-up";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Jobs
          </h1>
          <p className="text-xs text-[#6B7280]">
            Track HVAC quotes from draft to approval
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="min-h-[44px] bg-[#F97316] text-white hover:bg-[#EA580C] px-4 font-semibold shadow-none rounded-xl"
        >
          <Link href="/jobs/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New job</span>
          </Link>
        </Button>
      </div>

      {createdId && (
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-xs text-[#166534] flex items-center justify-between">
          <span>Job successfully saved with photos and notes. Ready for quote drafting.</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Status filter tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full bg-[#F3F4F6] p-1 rounded-xl h-11">
          <TabsTrigger
            value="all"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm rounded-lg"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm rounded-lg"
          >
            Draft
          </TabsTrigger>
          <TabsTrigger
            value="sent"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm rounded-lg"
          >
            Sent
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm rounded-lg"
          >
            Won
          </TabsTrigger>
          <TabsTrigger
            value="lost"
            className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-[#111827] data-[state=active]:shadow-sm rounded-lg"
          >
            Lost
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-[#E5E7EB] bg-white p-4 animate-pulse"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        /* Honest Empty State matching tone rules */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#4B5563] mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">
            {statusFilter === "all"
              ? "No jobs yet"
              : `No ${statusFilter === "approved" ? "won" : statusFilter} jobs`}
          </h3>
          <p className="mt-1 text-sm text-[#4B5563] max-w-[300px]">
            {statusFilter === "all"
              ? "Tap New job to capture photos, notes, and create your first quote."
              : `Switch tabs to view other jobs or create a new quote.`}
          </p>
          <div className="mt-5 flex gap-2">
            {statusFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter("all")}
                className="rounded-xl border-[#D1D5DB]"
              >
                Show all jobs
              </Button>
            )}
            <Button
              asChild
              className="bg-[#F97316] text-white hover:bg-[#EA580C] rounded-xl"
            >
              <Link href="/jobs/new">Create job</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* Jobs List matching Wireframe Screen 2 */
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isJustCreated = job.id === createdId;
            return (
              <div
                key={job.id}
                className={`rounded-2xl border bg-white p-4 transition-all ${
                  isJustCreated
                    ? "border-[#1D4ED8] ring-2 ring-[#1D4ED8]/20"
                    : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base text-[#111827]">
                        {job.customer.name}
                      </span>
                      <span className="text-xs text-[#6B7280] font-normal">
                        · {getJobTypeLabel(job.job_type)}
                      </span>
                    </div>

                    <p className="text-xs text-[#4B5563]">
                      {job.customer.address || "Address not provided"}
                    </p>

                    {job.notes && (
                      <p className="text-xs text-[#6B7280] line-clamp-1 italic mt-1">
                        &quot;{job.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {getStatusBadge(job.status)}
                    <span className="text-base font-bold text-[#111827]">
                      {job.quote?.total
                        ? `$${job.quote.total.toFixed(0)}`
                        : "--"}
                    </span>
                  </div>
                </div>

                {/* Footer metadata row */}
                <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-[11px] text-[#6B7280]">
                  <div className="flex items-center gap-3">
                    {job.photos && job.photos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5 text-[#4B5563]" />
                        <span>{job.photos.length} photo{job.photos.length === 1 ? "" : "s"}</span>
                      </span>
                    )}
                    <span>{job.customer.phone}</span>
                  </div>
                  <span className="text-[#9CA3AF]">
                    {new Date(job.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="space-y-4 max-w-xl mx-auto p-4 animate-pulse">
          <div className="h-10 bg-[#E5E7EB] rounded-xl w-1/3" />
          <div className="h-12 bg-[#F3F4F6] rounded-xl w-full" />
          <div className="space-y-3">
            <div className="h-24 bg-white rounded-2xl border border-[#E5E7EB]" />
            <div className="h-24 bg-white rounded-2xl border border-[#E5E7EB]" />
          </div>
        </div>
      }
    >
      <JobsContent />
    </React.Suspense>
  );
}
