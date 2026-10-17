"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Building2, DollarSign, Percent, ShieldAlert } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = React.useState("");
  const [laborRate, setLaborRate] = React.useState("95");
  const [markupPercent, setMarkupPercent] = React.useState("20");
  const [minMarginPercent, setMinMarginPercent] = React.useState("25");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isUnconfigured =
        !supabaseUrl ||
        supabaseUrl.includes("your-project") ||
        process.env.AUTH_MODE === "mock";

      if (isUnconfigured) {
        // Update mock cookie
        const existingCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("sitequote_mock_user="));
        let userData: any = {
          id: "demo-user-1",
          email: "tech@example.com",
          name: "HVAC Owner",
        };
        if (existingCookie) {
          try {
            userData = JSON.parse(decodeURIComponent(existingCookie.split("=")[1]));
          } catch {}
        }
        userData.company_name = companyName;
        userData.company_id = "demo-company-1";
        userData.labor_rate = parseFloat(laborRate) || 95;
        userData.markup_percent = parseFloat(markupPercent) || 20;
        userData.min_margin_percent = parseFloat(minMarginPercent) || 25;

        document.cookie = `sitequote_mock_user=${encodeURIComponent(
          JSON.stringify(userData)
        )}; path=/; max-age=86400`;

        router.push("/jobs");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Create company record
      const { data: company, error: companyError } = await (supabase
        .from("companies") as any)
        .insert({
          name: companyName.trim(),
          labor_rate: parseFloat(laborRate) || 95,
          markup_percent: parseFloat(markupPercent) || 20,
          min_margin_percent: parseFloat(minMarginPercent) || 25,
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      // 2. Link profile to the new company
      const { error: profileError } = await (supabase
        .from("profiles") as any)
        .upsert({
          id: user.id,
          company_id: company?.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Owner",
          role: "owner",
        });

      if (profileError) {
        throw profileError;
      }

      router.push("/jobs");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-sm">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Set up your company
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Configure your standard hourly rate and default margins
          </p>
        </div>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Pricing defaults</CardTitle>
            <CardDescription>
              These rates will be applied to every AI-drafted quote
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-lg border border-[#DC2626]/20 bg-[#DC2626]/10 p-3 text-sm text-[#DC2626]"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  placeholder="Apex Heating and Air"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laborRate">Hourly labor rate ($/hr)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="laborRate"
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    placeholder="95"
                    value={laborRate}
                    onChange={(e) => setLaborRate(e.target.value)}
                    className="pl-11"
                  />
                </div>
                <p className="text-xs text-[#6B7280]">
                  Standard technician hourly rate billed on residential jobs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="markupPercent">Default markup (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                    <Input
                      id="markupPercent"
                      type="number"
                      step="1"
                      min="0"
                      required
                      placeholder="20"
                      value={markupPercent}
                      onChange={(e) => setMarkupPercent(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minMarginPercent">Min margin warning (%)</Label>
                  <div className="relative">
                    <ShieldAlert className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                    <Input
                      id="minMarginPercent"
                      type="number"
                      step="1"
                      min="0"
                      required
                      placeholder="25"
                      value={minMarginPercent}
                      onChange={(e) => setMinMarginPercent(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6B7280]">
                If a quote&apos;s calculated margin falls below this minimum, SiteQuote will display a clear warning.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] text-white hover:bg-[#EA580C] min-h-[48px] text-base font-semibold mt-4"
              >
                {loading ? "Saving settings..." : "Finish setup and open jobs"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
