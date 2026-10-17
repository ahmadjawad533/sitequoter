"use client";

import * as React from "react";
import { Plus, Search, Tag, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function PricesPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
          Price book
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import CSV</span>
          </Button>
          <Button size="sm" className="bg-[#F97316] text-white hover:bg-[#EA580C] flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add item</span>
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
        <Input
          placeholder="Search items, parts, or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Empty State */}
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
          <Button variant="outline">
            Download sample CSV
          </Button>
          <Button className="bg-[#F97316] text-white hover:bg-[#EA580C]">
            Add item
          </Button>
        </div>
      </div>

      {/* Company Pricing Defaults Card */}
      <Card>
        <CardContent className="divide-y divide-[#E5E7EB] p-0">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold text-[#111827]">Hourly labor rate</div>
              <div className="text-xs text-[#4B5563]">Applied to estimated labor hours</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#111827]">$95 / hr</span>
              <Button variant="ghost" size="sm" className="text-[#1D4ED8]">
                Edit
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold text-[#111827]">Standard markup</div>
              <div className="text-xs text-[#4B5563]">Added to parts and materials</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#111827]">20%</span>
              <Button variant="ghost" size="sm" className="text-[#1D4ED8]">
                Edit
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold text-[#111827]">Minimum margin threshold</div>
              <div className="text-xs text-[#4B5563]">Warns if quote falls below this margin</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#111827]">25%</span>
              <Button variant="ghost" size="sm" className="text-[#1D4ED8]">
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
