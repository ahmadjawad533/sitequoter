"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JobsPage() {
  const [activeTab, setActiveTab] = React.useState("all");

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
          Jobs
        </h1>
        <Button asChild size="sm" className="bg-[#F97316] text-white hover:bg-[#EA580C]">
          <Link href="/jobs/new" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            <span>New job</span>
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="approved">Won</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Honest Empty State matching tone rules */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#4B5563] mb-4">
          <Briefcase className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[#111827]">
          No jobs yet
        </h3>
        <p className="mt-1 text-sm text-[#4B5563] max-w-[300px]">
          Tap New job to capture photos, notes, and create your first quote.
        </p>
        <Button asChild className="mt-5 bg-[#F97316] text-white hover:bg-[#EA580C]">
          <Link href="/jobs/new">Create first job</Link>
        </Button>
      </div>
    </div>
  );
}
