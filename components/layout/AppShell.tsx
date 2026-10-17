"use client";

import * as React from "react";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  companyName?: string;
  hideNav?: boolean;
}

export function AppShell({
  children,
  companyName = "Apex Heating and Air",
  hideNav = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111827]">
      <TopHeader companyName={companyName} />
      <main className="mx-auto max-w-[720px] px-4 py-4 pb-24 sm:py-6 sm:pb-28">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
