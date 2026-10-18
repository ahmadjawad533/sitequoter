"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EditableLineItem {
  id: string;
  description: string;
  qty: number;
  unit_price: number | null;
  is_unpriced?: boolean;
}

interface EditLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  line: EditableLineItem | null;
  onSave: (id: string, updated: { description: string; qty: number; unit_price: number }) => void;
}

export function EditLineDialog({
  isOpen,
  onClose,
  line,
  onSave,
}: EditLineDialogProps) {
  const [description, setDescription] = React.useState("");
  const [qty, setQty] = React.useState("1");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (line) {
      setDescription(line.description || "");
      setQty(String(line.qty || 1));
      setUnitPrice(line.unit_price !== null && line.unit_price !== undefined ? String(line.unit_price) : "");
      setError(null);
    }
  }, [line]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Item description is required.");
      return;
    }

    const parsedQty = parseFloat(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const parsedPrice = parseFloat(unitPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price cannot be negative.");
      return;
    }

    if (line) {
      onSave(line.id, {
        description: description.trim(),
        qty: parsedQty,
        unit_price: parsedPrice,
      });
      onClose();
    }
  };

  if (!line) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#111827]">
            {line.is_unpriced ? "Add Price for Item" : "Edit Line Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && (
            <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626]">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc" className="text-sm font-semibold text-[#111827]">
              Description
            </Label>
            <Input
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Part name or description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-qty" className="text-sm font-semibold text-[#111827]">
                Quantity
              </Label>
              <Input
                id="edit-qty"
                type="number"
                step="any"
                min="0.1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-price" className="text-sm font-semibold text-[#111827]">
                Unit Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F97316] text-white hover:bg-[#EA580C] rounded-xl font-semibold"
            >
              Save Line
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
