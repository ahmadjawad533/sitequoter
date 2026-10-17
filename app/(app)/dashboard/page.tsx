"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Clock, DollarSign, FileCheck, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Real data state (defaults to 0 / empty before database entries exist)
  const stats = {
    quotesSent: 0,
    approved: 0,
    approvedValue: 0,
    avgTimeToQuote: "--",
    aiLinesKept: "--",
  };

  const hasData = stats.quotesSent > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
          Dashboard
        </h1>
        <span className="text-sm font-medium text-[#4B5563]">This month</span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#4B5563] mb-4">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#111827]">
            No quotes yet
          </h3>
          <p className="mt-1 text-sm text-[#4B5563] max-w-[300px]">
            Once you create, send, and close quotes, your monthly business metrics will appear here.
          </p>
          <Button asChild className="mt-5 bg-[#F97316] text-white hover:bg-[#EA580C]">
            <Link href="/jobs/new">Create first job</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">
                Quotes sent
              </CardTitle>
              <Send className="h-4 w-4 text-[#1D4ED8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotesSent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">
                Approved quotes
              </CardTitle>
              <FileCheck className="h-4 w-4 text-[#16A34A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">
                Approved value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#16A34A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.approvedValue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">
                Avg time to send
              </CardTitle>
              <Clock className="h-4 w-4 text-[#D97706]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTimeToQuote}</div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#4B5563]">
                AI lines kept unchanged
              </CardTitle>
              <Sparkles className="h-4 w-4 text-[#1D4ED8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiLinesKept}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
