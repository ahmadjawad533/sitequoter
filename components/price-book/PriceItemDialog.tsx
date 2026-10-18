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
import { DollarSign, Trash2 } from "lucide-react";
import type { PriceItem } from "@/hooks/usePriceBook";
import { priceItemSchema } from "@/lib/validations/priceBook";

interface PriceItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PriceItem | null;
  onSave: (data: { name: string; category: string; unit: string; unit_price: number }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function PriceItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
  onDelete,
}: PriceItemDialogProps) {
  const isEditing = Boolean(item);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [unit, setUnit] = React.useState("each");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name);
        setCategory(item.category || "General");
        setUnit(item.unit || "each");
        setUnitPrice(item.unit_price.toString());
      } else {
        setName("");
        setCategory("General");
        setUnit("each");
        setUnitPrice("");
      }
      setError(null);
    }
  }, [open, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = priceItemSchema.safeParse({
      name,
      category,
      unit,
      unit_price: unitPrice,
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
      setError(err?.message || "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) return;
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setDeleting(true);
    try {
      await onDelete(item.id);
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit item" : "Add price item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update details or pricing for this item in your catalog."
              : "Add a new part, material, or labor item to your price book."}
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
            <Label htmlFor="item-name">Item name</Label>
            <Input
              id="item-name"
              required
              placeholder="e.g. Capacitor 45/5 MFD"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Input
                id="item-category"
                placeholder="e.g. Electrical"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-unit">Unit</Label>
              <Input
                id="item-unit"
                placeholder="each, lb, ft, hour"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-price">Unit price ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="38.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="pl-11"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 flex flex-row items-center justify-between gap-2">
            {isEditing && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>{deleting ? "Deleting..." : "Delete"}</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {submitting ? "Saving..." : isEditing ? "Save changes" : "Add item"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
