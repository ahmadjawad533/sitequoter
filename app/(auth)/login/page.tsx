"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, Wrench } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isUnconfigured =
        !supabaseUrl ||
        supabaseUrl.includes("your-project") ||
        process.env.AUTH_MODE === "mock";

      if (isUnconfigured) {
        // Fallback demo/mock authentication for local testing
        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }
        // Set mock session cookie
        document.cookie = `sitequote_mock_user=${encodeURIComponent(
          JSON.stringify({
            id: "demo-user-123",
            email,
            name: "Dave Miller",
            company_id: "demo-company-123",
          })
        )}; path=/; max-age=86400`;
        router.push("/jobs");
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/jobs");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* App Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-sm">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            SiteQuote
          </h1>
          <p className="mt-1 text-sm text-[#4B5563]">
            Fast, accurate HVAC quotes at the job site
          </p>
        </div>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Log in</CardTitle>
            <CardDescription>
              Enter your email and password to access your jobs
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tech@hvacpros.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] text-white hover:bg-[#EA580C] min-h-[48px] text-base font-semibold"
              >
                {loading ? "Signing in..." : "Log in"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E5E7EB] pt-4 text-center text-sm text-[#4B5563]">
              New here?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#1D4ED8] hover:underline"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer legal links */}
        <p className="mt-6 text-center text-xs text-[#6B7280]">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
