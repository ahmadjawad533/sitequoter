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
import { parsePriceBookCsv, type CsvParseResult } from "@/lib/csv/parser";
import type { PriceItemInput } from "@/lib/validations/priceBook";
import { AlertCircle, CheckCircle2, Download, FileUp, Upload } from "lucide-react";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (items: PriceItemInput[]) => Promise<number>;
}

export function CsvImportDialog({
  open,
  onOpenChange,
  onImport,
}: CsvImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parseResult, setParseResult] = React.useState<CsvParseResult | null>(null);
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
        const result = parsePriceBookCsv(text);
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
      setError(err?.message || "Failed to import price book items.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import price book from CSV</DialogTitle>
          <DialogDescription>
            Upload a spreadsheet with columns: name, category, unit, unit_price.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]"
          >
            {error}
          </div>
        )}

        {/* Download Sample CSV Action */}
        <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-3 text-sm">
          <span className="text-[#4B5563]">Need a template to start with?</span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 bg-white text-[#1D4ED8]"
          >
            <a href="/sample_price_book.csv" download="sample_price_book.csv">
              <Download className="h-4 w-4" />
              <span>Download sample CSV</span>
            </a>
          </Button>
        </div>

        {/* File Picker Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#1D4ED8] bg-white p-6 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#1D4ED8] mb-2">
            <FileUp className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-[#111827]">
            {file ? file.name : "Click to select CSV file"}
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Supports standard CSV files exported from Excel, QuickBooks, or distributors.
          </p>
        </div>

        {/* Validation Results & Error Reporting */}
        {parseResult && (
          <div className="space-y-3">
            {/* Summary Banner */}
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${
                parseResult.errors.length === 0
                  ? "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20"
                  : parseResult.validItems.length > 0
                  ? "bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
                  : "bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20"
              }`}
            >
              {parseResult.errors.length === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>
                    All {parseResult.validItems.length} items are valid and ready to import.
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>
                    Found {parseResult.validItems.length} valid items and {parseResult.errors.length} rows with errors.
                  </span>
                </>
              )}
            </div>

            {/* Row-Level Errors List */}
            {parseResult.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                  Row Error Report ({parseResult.errors.length}):
                </p>
                {parseResult.errors.map((err, idx) => (
                  <div key={idx} className="text-xs text-[#111827] border-b border-[#E5E7EB] pb-1.5 last:border-0 last:pb-0">
                    <span className="font-semibold text-[#DC2626]">Row {err.rowNumber}: </span>
                    <span>{err.message}</span>
                    {err.rawText && (
                      <p className="text-[11px] font-mono text-[#6B7280] truncate mt-0.5">
                        &quot;{err.rawText}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>

          {parseResult && parseResult.validItems.length > 0 && (
            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={submitting}
              className="bg-[#F97316] text-white hover:bg-[#EA580C] flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              <span>
                {submitting
                  ? "Importing..."
                  : `Import ${parseResult.validItems.length} valid item${
                      parseResult.validItems.length === 1 ? "" : "s"
                    }`}
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
