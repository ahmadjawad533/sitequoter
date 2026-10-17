import Link from "next/link";
import { ArrowRight, Camera, FileCheck2, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827]">
      {/* Navigation header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-16 max-w-[720px] items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">
              SiteQuote
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#111827] hover:text-[#1D4ED8] px-3 py-2"
            >
              Log in
            </Link>
            <Button asChild size="sm" className="bg-[#F97316] text-white hover:bg-[#EA580C]">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main hero section */}
      <main className="mx-auto max-w-[720px] px-4 py-12 sm:py-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
            <ShieldCheck className="h-4 w-4" />
            <span>Built for residential HVAC contractors</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl sm:leading-tight">
            Turn job photos into a priced HVAC quote in minutes.
          </h1>

          <p className="text-lg leading-relaxed text-[#4B5563]">
            Take photos and dictate notes on site. SiteQuote matches parts from your price book, calculates labor, and drafts a complete quote for your review.
          </p>

          <div className="pt-2">
            <Button
              asChild
              className="w-full sm:w-auto min-h-[48px] px-8 bg-[#F97316] text-white hover:bg-[#EA580C] text-base font-semibold"
            >
              <Link href="/signup" className="flex items-center justify-center gap-2">
                Start quoting now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 3 Step Process */}
        <section className="mt-16 border-t border-[#E5E7EB] pt-12">
          <h2 className="text-xl font-bold text-[#111827] sm:text-2xl mb-6">
            How it works
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#1D4ED8]">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  1. Capture photos and speak your notes
                </h3>
                <p className="mt-1 text-sm text-[#4B5563] leading-relaxed">
                  Take up to six photos of the equipment, nameplate, or ductwork. Speak or type what needs to be done.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#1D4ED8]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  2. AI drafts items from your price book
                </h3>
                <p className="mt-1 text-sm text-[#4B5563] leading-relaxed">
                  The AI references only your approved catalog and hourly labor rates. It explains the reason for every item.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6] text-[#1D4ED8]">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[#111827]">
                  3. You review, edit, and send
                </h3>
                <p className="mt-1 text-sm text-[#4B5563] leading-relaxed">
                  Check the margin, adjust any quantities, and send a clean link or PDF directly to the customer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transparent Pricing Note */}
        <section className="mt-12 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-6">
          <h2 className="text-base font-bold text-[#111827]">
            Pricing
          </h2>
          <p className="mt-1 text-sm text-[#4B5563]">
            [PRICE TBD] Simple monthly subscription for small crews. No long contracts, no setup fees.
          </p>
        </section>
      </main>

      {/* Clean footer */}
      <footer className="mt-12 border-t border-[#E5E7EB] bg-white py-8">
        <div className="mx-auto flex max-w-[720px] flex-col items-center justify-between gap-4 px-4 sm:flex-row text-sm text-[#6B7280]">
          <p>SiteQuote. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#111827] hover:underline">
              Terms and Conditions
            </Link>
            <Link href="/privacy" className="hover:text-[#111827] hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
