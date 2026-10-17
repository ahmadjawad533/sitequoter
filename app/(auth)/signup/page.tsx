"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, User, Wrench } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("You must agree to the Terms and Conditions and Privacy Policy.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
        // Fallback demo/mock registration for local testing
        document.cookie = `sitequote_mock_user=${encodeURIComponent(
          JSON.stringify({
            id: "demo-user-" + Date.now(),
            email,
            name: name || "HVAC Tech",
            company_id: null,
          })
        )}; path=/; max-age=86400`;
        router.push("/onboarding");
        return;
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // If session exists immediately (email confirmation disabled in Supabase)
      if (data.session) {
        // Insert initial profile if not already handled by trigger
        await (supabase.from("profiles") as any).upsert({
          id: data.user!.id,
          name: name || email.split("@")[0],
          role: "owner",
        });
        router.push("/onboarding");
      } else {
        // Email confirmation requested or user created
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
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
            Start drafting quotes in under three minutes
          </p>
        </div>

        <Card className="border-[#E5E7EB] shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Create account</CardTitle>
            <CardDescription>
              One account manages your HVAC price book, jobs, and quotes
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
                <Label htmlFor="name">Your name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="name"
                    type="text"
                    required
                    placeholder="Mike Roberts"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="mike@robertshvac.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-[#9CA3AF]" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              {/* Mandatory Terms & Privacy Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  id="agree"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-[#E5E7EB] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <Label htmlFor="agree" className="text-xs leading-normal font-normal text-[#4B5563]">
                  By creating an account, you agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-medium text-[#1D4ED8] underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-medium text-[#1D4ED8] underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F97316] text-white hover:bg-[#EA580C] min-h-[48px] text-base font-semibold mt-2"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E5E7EB] pt-4 text-center text-sm text-[#4B5563]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1D4ED8] hover:underline"
              >
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
