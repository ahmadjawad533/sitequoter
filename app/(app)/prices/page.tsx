"use client";

import * as React from "react";
import { ChevronRight, Plus, Search, Tag, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePriceBook, type PriceItem } from "@/hooks/usePriceBook";
import { PriceItemDialog } from "@/components/price-book/PriceItemDialog";
import { CsvImportDialog } from "@/components/price-book/CsvImportDialog";
import { CompanySettingsDialog } from "@/components/price-book/CompanySettingsDialog";

export default function PricesPage() {
  const {
    filteredItems,
    items,
    categories,
    settings,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    importCsvItems,
    updateCompanySettings,
  } = usePriceBook();

  // Modals state
  const [itemDialogOpen, setItemDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PriceItem | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = React.useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleOpenEdit = (item: PriceItem) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleSaveItem = async (data: any) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await addItem(data);
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Price book
          </h1>
          <p className="text-xs text-[#4B5563]">
            {items.length} item{items.length === 1 ? "" : "s"} in catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvDialogOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-[#F97316] text-white hover:bg-[#EA580C] flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add item</span>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]"
        >
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
        <Input
          placeholder="Search items, parts, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-3.5 text-[#9CA3AF] hover:text-[#111827]"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category Pills (if multiple categories exist) */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              selectedCategory === "all"
                ? "bg-[#1D4ED8] text-white"
                : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-[#1D4ED8] text-white"
                  : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Items List / Empty States */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-[#E5E7EB] bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#4B5563] mb-4">
            <Tag className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">
            No price items yet
          </h3>
          <p className="mt-1 text-sm text-[#4B5563] max-w-[320px]">
            Import a CSV from your distributor or add items one by one to give the AI your exact parts and prices.
          </p>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={() => setCsvDialogOpen(true)}>
              Import CSV
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="bg-[#F97316] text-white hover:bg-[#EA580C]"
            >
              Add item
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="text-sm font-semibold text-[#111827]">
            No items match &quot;{searchQuery}&quot;
          </p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Try another search term or clear the filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4"
          >
            Clear search
          </Button>
        </div>
      ) : (
        <Card className="divide-y divide-[#E5E7EB] overflow-hidden p-0 shadow-sm">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEdit(item)}
              className="flex items-center justify-between p-4 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#111827] text-base truncate">
                    {item.name}
                  </span>
                  {item.category && item.category !== "General" && (
                    <Badge variant="secondary" className="shrink-0 text-[11px]">
                      {item.category}
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-[#6B7280]">
                  Unit: {item.unit || "each"}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-base font-bold text-[#111827]">
                  ${Number(item.unit_price).toFixed(2)}
                </span>
                <ChevronRight className="h-5 w-5 text-[#9CA3AF]" />
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Company Pricing Defaults Card */}
      <div className="pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#4B5563] mb-3 px-1">
          Company pricing defaults
        </h2>
        <Card className="shadow-sm">
          <CardContent className="divide-y divide-[#E5E7EB] p-0">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  Hourly labor rate
                </div>
                <div className="text-xs text-[#6B7280]">
                  Standard technician rate billed on quotes
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#111827]">
                  ${settings.labor_rate} / hr
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsDialogOpen(true)}
                  className="text-[#1D4ED8]"
                >
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  Standard markup
                </div>
                <div className="text-xs text-[#6B7280]">
                  Markup percentage applied to materials
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#111827]">
                  {settings.markup_percent}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsDialogOpen(true)}
                  className="text-[#1D4ED8]"
                >
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  Minimum margin threshold
                </div>
                <div className="text-xs text-[#6B7280]">
                  Warns if an edited quote drops below this percentage
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#111827]">
                  {settings.min_margin_percent}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettingsDialogOpen(true)}
                  className="text-[#1D4ED8]"
                >
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <PriceItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        onSave={handleSaveItem}
        onDelete={editingItem ? deleteItem : undefined}
      />

      <CsvImportDialog
        open={csvDialogOpen}
        onOpenChange={setCsvDialogOpen}
        onImport={importCsvItems}
      />

      <CompanySettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        settings={settings}
        onSave={updateCompanySettings}
      />
    </div>
  );
}
