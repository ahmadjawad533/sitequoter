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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Percent, ShieldAlert } from "lucide-react";
import { companySettingsSchema, type CompanySettingsInput } from "@/lib/validations/priceBook";
import type { CompanySettings } from "@/hooks/usePriceBook";

interface CompanySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CompanySettings;
  onSave: (data: CompanySettingsInput) => Promise<void>;
}

export function CompanySettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: CompanySettingsDialogProps) {
  const [laborRate, setLaborRate] = React.useState("95");
  const [markupPercent, setMarkupPercent] = React.useState("20");
  const [minMarginPercent, setMinMarginPercent] = React.useState("25");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setLaborRate(settings.labor_rate.toString());
      setMarkupPercent(settings.markup_percent.toString());
      setMinMarginPercent(settings.min_margin_percent.toString());
      setError(null);
    }
  }, [open, settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = companySettingsSchema.safeParse({
      labor_rate: laborRate,
      markup_percent: markupPercent,
      min_margin_percent: minMarginPercent,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message || "Please check your inputs.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(validation.data);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to update pricing settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Company pricing defaults</DialogTitle>
          <DialogDescription>
            These rates determine labor calculations and default margins for new quotes.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-labor-rate">Hourly labor rate ($/hr)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
              <Input
                id="edit-labor-rate"
                type="number"
                step="0.5"
                min="1"
                required
                value={laborRate}
                onChange={(e) => setLaborRate(e.target.value)}
                className="pl-11"
              />
            </div>
            <p className="text-xs text-[#6B7280]">
              Standard hourly billing rate for technician labor.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-markup">Standard markup (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                <Input
                  id="edit-markup"
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-min-margin">Min margin (%)</Label>
              <div className="relative">
                <ShieldAlert className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                <Input
                  id="edit-min-margin"
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={minMarginPercent}
                  onChange={(e) => setMinMarginPercent(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-[#6B7280]">
            The app warns if an edited quote falls below your minimum margin.
          </p>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#F97316] text-white hover:bg-[#EA580C]"
            >
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
