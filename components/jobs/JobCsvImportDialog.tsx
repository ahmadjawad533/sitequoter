"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseJobsCsv, type CsvJobParseResult, type CsvJobInput } from "@/lib/csv/parser";
import { AlertCircle, CheckCircle2, Download, FileUp, Upload } from "lucide-react";

interface JobCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (jobs: CsvJobInput[]) => Promise<number>;
}

export function JobCsvImportDialog({
  open,
  onOpenChange,
  onImport,
}: JobCsvImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parseResult, setParseResult] = React.useState<CsvJobParseResult | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null);
      setParseResult(null);
      setError(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a valid CSV file (.csv).");
      return;
    }

    setFile(selected);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const result = parseJobsCsv(text);
        setParseResult(result);
      } catch (err: any) {
        setError("Failed to parse CSV file: " + (err?.message || "Unknown error"));
      }
    };
    reader.readAsText(selected);
  };

  const handleConfirmImport = async () => {
    if (!parseResult || parseResult.validItems.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      await onImport(parseResult.validItems);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to import jobs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#111827]">
            Import jobs from CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6B7280]">
            Upload a spreadsheet with columns: customer_name, phone, address, job_type, notes, status.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-xs text-[#DC2626] flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 py-2">
          {/* File drop zone / selector */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-6 text-center cursor-pointer hover:border-[#1D4ED8] transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8] mb-2">
              <FileUp className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-[#111827]">
              {file ? file.name : "Click to select a CSV file"}
            </p>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Supports standard CSV format
            </p>
          </div>

          {/* Download sample CSV template button */}
          <div className="flex items-center justify-between rounded-xl bg-[#F3F4F6] p-3 text-xs text-[#374151]">
            <span>Need a starter template?</span>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="min-h-[48px] bg-white text-[#1D4ED8] border-[#D1D5DB] hover:bg-[#F9FAFB] text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <a href="/sample_jobs.csv" download="sample_jobs.csv">
                <Download className="h-3.5 w-3.5" />
                <span>Download sample CSV</span>
              </a>
            </Button>
          </div>

          {/* Parse summary */}
          {parseResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-3 text-[#166534]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">{parseResult.validItems.length} valid jobs</p>
                    <p className="text-[11px] text-[#15803D]">Ready to import</p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 ${
                    parseResult.errors.length > 0
                      ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B]"
                      : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">{parseResult.errors.length} error rows</p>
                    <p className="text-[11px]">
                      {parseResult.errors.length > 0 ? "Will be skipped" : "No errors"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error list */}
              {parseResult.errors.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-xl border border-[#E5E7EB] p-2 space-y-1 text-xs">
                  {parseResult.errors.map((err, i) => (
                    <div key={i} className="text-[#DC2626] font-mono text-[11px]">
                      Row {err.rowNumber}: {err.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="min-h-[48px] rounded-xl border-[#D1D5DB] text-[#374151]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parseResult || parseResult.validItems.length === 0 || submitting}
            className="min-h-[48px] rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-semibold"
          >
            {submitting
              ? "Importing..."
              : `Import ${parseResult?.validItems.length || 0} jobs`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
