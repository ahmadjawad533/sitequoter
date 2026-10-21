"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { CsvJobInput } from "@/lib/csv/parser";

export interface Customer {
  id?: string;
  name: string;
  phone: string;
  address: string;
}

export interface JobPhoto {
  id: string;
  job_id?: string;
  storage_path: string;
  preview_url: string;
}

export interface JobQuoteSummary {
  id: string;
  total: number;
  status: "draft" | "sent" | "approved" | "lost";
  sent_at?: string | null;
  approved_at?: string | null;
}

export interface Job {
  id: string;
  company_id?: string;
  customer_id?: string;
  customer: Customer;
  job_type: "repair" | "replacement" | "maintenance";
  notes: string;
  status: "draft" | "sent" | "approved" | "lost";
  created_at: string;
  photos: JobPhoto[];
  quote?: JobQuoteSummary | null;
}

export interface CreateJobInput {
  customerName: string;
  phone: string;
  address: string;
  jobType: "repair" | "replacement" | "maintenance";
  notes: string;
  photos: File[];
}

const DEFAULT_SAMPLE_JOBS: Job[] = [
  {
    id: "job-sample-1",
    customer: {
      id: "cust-1",
      name: "Ahmed Khan",
      phone: "(555) 234-5678",
      address: "12 Oak St",
    },
    job_type: "repair",
    notes: "Condenser fan not spinning. Humming sound from compressor. Suspected dual run capacitor or seized fan motor.",
    status: "sent",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    photos: [],
    quote: {
      id: "quote-1",
      total: 480.0,
      status: "sent",
      sent_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  },
  {
    id: "job-sample-2",
    customer: {
      id: "cust-2",
      name: "Sara Ali",
      phone: "(555) 876-5432",
      address: "8 Pine Rd",
    },
    job_type: "replacement",
    notes: "Furnace cracked heat exchanger. Unit is 22 years old. Homeowner wants replacement quote for 80k BTU high efficiency gas furnace.",
    status: "draft",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    photos: [],
    quote: null,
  },
  {
    id: "job-sample-3",
    customer: {
      id: "cust-3",
      name: "Mike R.",
      phone: "(555) 345-6789",
      address: "3 Elm Ave",
    },
    job_type: "maintenance",
    notes: "Annual spring AC tune-up. Cleaned coils, checked refrigerant subcooling, flushed condensate line.",
    status: "approved",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    photos: [],
    quote: {
      id: "quote-3",
      total: 220.0,
      status: "approved",
      sent_at: new Date(Date.now() - 3600000 * 40).toISOString(),
      approved_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    },
  },
];

export function useJobs() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  const loadJobs = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isMock) {
        const stored = localStorage.getItem("sitequote_jobs");
        if (stored) {
          try {
            setJobs(JSON.parse(stored));
          } catch {
            setJobs(DEFAULT_SAMPLE_JOBS);
            localStorage.setItem("sitequote_jobs", JSON.stringify(DEFAULT_SAMPLE_JOBS));
          }
        } else {
          setJobs(DEFAULT_SAMPLE_JOBS);
          localStorage.setItem("sitequote_jobs", JSON.stringify(DEFAULT_SAMPLE_JOBS));
        }
        return;
      }

      // Live Supabase
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("No company found");

      // Fetch jobs with customer and quote
      const { data: jobsData, error: jobsErr } = await (supabase.from("jobs") as any)
        .select(`
          *,
          customer:customers(*),
          photos:job_photos(*),
          quotes(*)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (jobsErr) throw jobsErr;

      const formattedJobs: Job[] = (jobsData || []).map((j: any) => {
        const latestQuote = j.quotes && j.quotes.length > 0 ? j.quotes[0] : null;
        return {
          id: j.id,
          company_id: j.company_id,
          customer_id: j.customer_id,
          customer: {
            id: j.customer?.id,
            name: j.customer?.name || "Customer",
            phone: j.customer?.phone || "",
            address: j.customer?.address || "",
          },
          job_type: j.job_type,
          notes: j.notes || "",
          status: j.status,
          created_at: j.created_at,
          photos: (j.photos || []).map((p: any) => ({
            id: p.id,
            job_id: p.job_id,
            storage_path: p.storage_path,
            preview_url: "", // In live mode, signed URLs are generated on demand
          })),
          quote: latestQuote
            ? {
                id: latestQuote.id,
                total: Number(latestQuote.total),
                status: latestQuote.status,
                sent_at: latestQuote.sent_at,
                approved_at: latestQuote.approved_at,
              }
            : null,
        };
      });

      setJobs(formattedJobs);
    } catch (err: any) {
      setError(err?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [isMock]);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const createJob = async (input: CreateJobInput): Promise<Job> => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        // Read photos as object URLs
        const photoObjects: JobPhoto[] = input.photos.map((f, i) => ({
          id: `photo-${Date.now()}-${i}`,
          storage_path: `mock/${f.name}`,
          preview_url: URL.createObjectURL(f),
        }));

        const newJob: Job = {
          id: "job-" + Date.now(),
          customer: {
            id: "cust-" + Date.now(),
            name: input.customerName.trim(),
            phone: input.phone.trim(),
            address: input.address.trim(),
          },
          job_type: input.jobType,
          notes: input.notes.trim(),
          status: "draft",
          created_at: new Date().toISOString(),
          photos: photoObjects,
          quote: null,
        };

        const updated = [newJob, ...jobs];
        setJobs(updated);
        localStorage.setItem("sitequote_jobs", JSON.stringify(updated));
        return newJob;
      }

      // Live Supabase
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user!.id)
        .single();

      const companyId = profile.company_id;

      // 1. Insert customer
      const { data: customer, error: custErr } = await (supabase.from("customers") as any)
        .insert({
          company_id: companyId,
          name: input.customerName.trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
        })
        .select()
        .single();

      if (custErr) throw custErr;

      // 2. Insert job
      const { data: job, error: jobErr } = await (supabase.from("jobs") as any)
        .insert({
          company_id: companyId,
          customer_id: customer.id,
          created_by: user!.id,
          job_type: input.jobType,
          notes: input.notes.trim(),
          status: "draft",
        })
        .select()
        .single();

      if (jobErr) throw jobErr;

      // 3. Upload photos and insert job_photos
      const uploadedPhotos: JobPhoto[] = [];
      for (let i = 0; i < input.photos.length; i++) {
        const photoFile = input.photos[i];
        const storagePath = `${companyId}/${job.id}/${Date.now()}_${i}.jpg`;

        const { error: uploadErr } = await supabase.storage
          .from("job-photos")
          .upload(storagePath, photoFile, {
            contentType: "image/jpeg",
          });

        if (!uploadErr) {
          const { data: photoRecord } = await (supabase.from("job_photos") as any)
            .insert({
              job_id: job.id,
              storage_path: storagePath,
            })
            .select()
            .single();

          if (photoRecord) {
            uploadedPhotos.push({
              id: photoRecord.id,
              job_id: job.id,
              storage_path: storagePath,
              preview_url: "",
            });
          }
        }
      }

      const createdJob: Job = {
        id: job.id,
        company_id: companyId,
        customer_id: customer.id,
        customer,
        job_type: job.job_type,
        notes: job.notes,
        status: job.status,
        created_at: job.created_at,
        photos: uploadedPhotos,
        quote: null,
      };

      setJobs((prev) => [createdJob, ...prev]);
      return createdJob;
    } catch (err: any) {
      setError(err?.message || "Failed to create job");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const importCsvJobs = async (importedJobs: CsvJobInput[]): Promise<number> => {
    setSaving(true);
    setError(null);

    try {
      if (isMock) {
        const newJobList: Job[] = importedJobs.map((item, idx) => ({
          id: `job-imported-${Date.now()}-${idx}`,
          customer: {
            id: `cust-${Date.now()}-${idx}`,
            name: item.customerName,
            phone: item.phone,
            address: item.address,
          },
          job_type: item.jobType,
          notes: item.notes,
          status: item.status,
          created_at: new Date().toISOString(),
          photos: [],
          quote: null,
        }));

        const updated = [...newJobList, ...jobs];
        setJobs(updated);
        localStorage.setItem("sitequote_jobs", JSON.stringify(updated));
        return newJobList.length;
      }

      // Live Supabase Mode
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not logged in");

      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user.id)
        .single();

      const companyId = profile?.company_id;
      if (!companyId) throw new Error("No company found for profile");

      let count = 0;
      for (const item of importedJobs) {
        // 1. Insert customer
        const { data: customer, error: custErr } = await (supabase.from("customers") as any)
          .insert({
            company_id: companyId,
            name: item.customerName,
            phone: item.phone,
            address: item.address,
          })
          .select()
          .single();

        if (custErr) continue;

        // 2. Insert job
        const { error: jobErr } = await (supabase.from("jobs") as any)
          .insert({
            company_id: companyId,
            customer_id: customer.id,
            created_by: user.id,
            job_type: item.jobType,
            notes: item.notes,
            status: item.status || "draft",
          });

        if (!jobErr) count++;
      }

      await loadJobs();
      return count;
    } catch (err: any) {
      setError(err?.message || "Failed to import jobs from CSV");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const filteredJobs = React.useMemo(() => {
    if (statusFilter === "all") return jobs;
    return jobs.filter((j) => j.status === statusFilter);
  }, [jobs, statusFilter]);

  return {
    jobs,
    filteredJobs,
    statusFilter,
    setStatusFilter,
    loading,
    saving,
    error,
    createJob,
    importCsvJobs,
    refresh: loadJobs,
  };
}
