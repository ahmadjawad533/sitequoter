"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhotoUploader, StoredPhoto } from "@/components/jobs/PhotoUploader";
import { VoiceNotesInput } from "@/components/jobs/VoiceNotesInput";
import { useJobs } from "@/hooks/useJobs";

type JobType = "repair" | "replacement" | "maintenance";

export default function NewJobPage() {
  const router = useRouter();
  const { createJob } = useJobs();

  const [customerName, setCustomerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [jobType, setJobType] = React.useState<JobType>("repair");
  const [photos, setPhotos] = React.useState<StoredPhoto[]>([]);
  const [notes, setNotes] = React.useState("");

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = "Customer name is required.";
    } else if (customerName.trim().length < 2) {
      errors.customerName = "Name must be at least 2 characters.";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    if (!address.trim()) {
      errors.address = "Job address is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [generationStep, setGenerationStep] = React.useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError(null);
    setGenerationStep("Saving job and compressed photos...");

    try {
      const created = await createJob({
        customerName,
        phone,
        address,
        jobType,
        notes,
        photos: photos.map((p) => p.file),
      });

      setGenerationStep("AI analyzing equipment and matching price book...");

      // Call server-side quote generation API
      const res = await fetch("/api/quotes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: created.id,
          jobType,
          notes,
          companySettings: {
            labor_rate: 95,
            markup_percent: 20,
            min_margin_percent: 25,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const quoteId = data.quoteId || data.quote?.id;
        if (quoteId) {
          // Store quote in local mock storage for fast offline navigation
          try {
            const stored = localStorage.getItem("sitequote_quotes");
            const list = stored ? JSON.parse(stored) : [];
            const newQuoteData = {
              ...data.quote,
              customerName: created.customer.name,
              customerPhone: created.customer.phone,
              customerAddress: created.customer.address,
              jobType: created.job_type,
            };
            list.unshift(newQuoteData);
            localStorage.setItem("sitequote_quotes", JSON.stringify(list));
          } catch {}

          // Navigate directly to Wireframe Screen 4 (Quote Review)
          router.push(`/quotes/${quoteId}`);
          return;
        }
      }

      // Fallback: navigate to jobs list
      router.push(`/jobs?created=${created.id}`);
    } catch (err: any) {
      setGeneralError(err?.message || "Failed to create job and draft quote. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Top Header / Back Navigation */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 rounded-xl text-[#374151] hover:bg-[#F3F4F6]"
        >
          <Link href="/jobs" aria-label="Back to jobs list">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111827]">
            New Job
          </h1>
          <p className="text-xs text-[#6B7280]">
            Enter customer details, add photos, and draft a quote.
          </p>
        </div>
      </div>

      {generalError && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
          {generalError}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4B5563]">
            Customer Details
          </h2>

          <div className="space-y-1.5">
            <Label htmlFor="customerName" className="text-sm font-medium text-[#111827]">
              Customer name <span className="text-[#DC2626]">*</span>
            </Label>
            <Input
              id="customerName"
              placeholder="e.g. John Miller"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (formErrors.customerName) {
                  setFormErrors((prev) => ({ ...prev, customerName: "" }));
                }
              }}
              disabled={isSubmitting}
            />
            {formErrors.customerName && (
              <p className="text-xs text-[#DC2626]">{formErrors.customerName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-[#111827]">
                Phone number <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formErrors.phone) {
                    setFormErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                disabled={isSubmitting}
              />
              {formErrors.phone && (
                <p className="text-xs text-[#DC2626]">{formErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium text-[#111827]">
                Job address <span className="text-[#DC2626]">*</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Main St, City"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (formErrors.address) {
                    setFormErrors((prev) => ({ ...prev, address: "" }));
                  }
                }}
                disabled={isSubmitting}
              />
              {formErrors.address && (
                <p className="text-xs text-[#DC2626]">{formErrors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Job Type Selector */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 space-y-3">
          <label className="text-sm font-semibold uppercase tracking-wider text-[#4B5563]">
            Job Type
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {(
              [
                { value: "repair", label: "Repair", desc: "Fix unit" },
                { value: "replacement", label: "Replace", desc: "New unit" },
                { value: "maintenance", label: "Tune-up", desc: "Service" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setJobType(t.value)}
                className={`flex flex-col items-center justify-center min-h-[56px] p-2.5 rounded-xl border text-center transition-all ${
                  jobType === t.value
                    ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8] ring-2 ring-[#1D4ED8]/20 font-semibold"
                    : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
                }`}
              >
                <span className="text-sm">{t.label}</span>
                <span className="text-[11px] text-[#6B7280]">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photos Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            maxPhotos={6}
          />
        </div>

        {/* Voice and Text Notes */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
          <VoiceNotesInput
            value={notes}
            onChange={setNotes}
            placeholder="Equipment condition, symptoms, homeowner preferences..."
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[52px] rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] text-base font-semibold shadow-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{generationStep || "Generating AI quote..."}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Quote</span>
              </>
            )}
          </Button>
          <p className="text-center text-xs text-[#6B7280] mt-2.5">
            Next: Review proposed price items, adjust labor, and send to customer.
          </p>
        </div>
      </form>
    </div>
  );
}
