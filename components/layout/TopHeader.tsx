"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TopHeaderProps {
  companyName?: string;
}

export function TopHeader({ companyName = "SiteQuote" }: TopHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isConfigured =
        supabaseUrl &&
        !supabaseUrl.includes("your-project") &&
        process.env.AUTH_MODE !== "mock";

      if (isConfigured) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }

      // Clear mock cookies if present
      document.cookie =
        "sitequote_mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto flex h-14 max-w-[720px] items-center justify-between px-4">
        <Link
          href="/jobs"
          className="flex items-center gap-2 font-bold text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-lg p-1"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-base truncate max-w-[200px] sm:max-w-[320px]">
            {companyName}
          </span>
        </Link>

        <button
          onClick={handleSignOut}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
