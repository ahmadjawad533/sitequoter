"use client";

import * as React from "react";
import { Search, Plus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PriceItemForAi } from "@/lib/ai/schemas";

interface AddQuoteLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  priceBook: PriceItemForAi[];
  onAdd: (item: {
    price_item_id: string | null;
    description: string;
    qty: number;
    unit_price: number;
    cost?: number;
  }) => void;
}

export function AddQuoteLineDialog({
  isOpen,
  onClose,
  priceBook,
  onAdd,
}: AddQuoteLineDialogProps) {
  const [tab, setTab] = React.useState<"catalog" | "custom">("catalog");
  const [search, setSearch] = React.useState("");

  // Custom item state
  const [customName, setCustomName] = React.useState("");
  const [customQty, setCustomQty] = React.useState("1");
  const [customPrice, setCustomPrice] = React.useState("");
  const [customError, setCustomError] = React.useState<string | null>(null);

  const filteredCatalog = React.useMemo(() => {
    if (!search.trim()) return priceBook;
    const q = search.toLowerCase();
    return priceBook.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [priceBook, search]);

  const handleSelectCatalogItem = (item: PriceItemForAi) => {
    onAdd({
      price_item_id: item.id,
      description: item.name,
      qty: 1,
      unit_price: item.unit_price,
      cost: item.cost || item.unit_price * 0.5,
    });
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!customName.trim()) {
      setCustomError("Item name is required.");
      return;
    }

    const parsedQty = parseFloat(customQty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setCustomError("Quantity must be greater than zero.");
      return;
    }

    const parsedPrice = parseFloat(customPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setCustomError("Price cannot be negative.");
      return;
    }

    onAdd({
      price_item_id: null,
      description: customName.trim(),
      qty: parsedQty,
      unit_price: parsedPrice,
      cost: parsedPrice * 0.55,
    });

    // Reset form
    setCustomName("");
    setCustomQty("1");
    setCustomPrice("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#111827]">
            Add Item to Quote
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as any)}
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="catalog">Price Book</TabsTrigger>
            <TabsTrigger value="custom">Custom Item</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="flex-1 flex flex-col overflow-hidden space-y-3 m-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input
                placeholder="Search catalog items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px]">
              {filteredCatalog.length === 0 ? (
                <div className="text-center py-8 text-sm text-[#6B7280]">
                  No items match your search.
                </div>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:border-[#1D4ED8] bg-white transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#111827]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#6B7280]">
                        {item.category || "General"} · ${item.unit_price} / {item.unit}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSelectCatalogItem(item)}
                      className="bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] font-semibold h-8 rounded-lg"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 m-0">
            <form onSubmit={handleAddCustom} className="space-y-4">
              {customError && (
                <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626]">
                  {customError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="custom-name" className="text-sm font-semibold text-[#111827]">
                  Item Description
                </Label>
                <Input
                  id="custom-name"
                  placeholder="e.g. Line set copper tubing 3/8 x 7/8"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-qty" className="text-sm font-semibold text-[#111827]">
                    Quantity
                  </Label>
                  <Input
                    id="custom-qty"
                    type="number"
                    step="any"
                    min="0.1"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="custom-price" className="text-sm font-semibold text-[#111827]">
                    Unit Price ($)
                  </Label>
                  <Input
                    id="custom-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
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
                  Add Custom Item
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
