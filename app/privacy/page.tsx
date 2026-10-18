import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for SiteQuote.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center text-sm font-medium text-[#1D4ED8] hover:underline mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <header className="border-b border-[#E5E7EB] pb-6 mb-6">
          <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            Effective Date: October 18, 2026. Draft for review.
          </p>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-[#111827]">
          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              1. Overview
            </h2>
            <p>
              SiteQuote (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by [COMPANY LEGAL NAME], respects your privacy. This policy explains what information we collect when you use SiteQuote, why we collect it, how it is processed, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              2. Information We Collect
            </h2>
            <p className="mb-2">We collect only information necessary to provide HVAC quoting and paperwork services:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#374151]">
              <li>
                <strong>Account Information:</strong> Your name, company name, login email, and billing settings (such as hourly labor rate, markup percentage, and minimum margin threshold).
              </li>
              <li>
                <strong>Customer Data:</strong> Homeowner or client names, phone numbers, and service addresses entered by you or your technicians to generate quotes.
              </li>
              <li>
                <strong>Job Photos and Notes:</strong> Equipment photographs, handwritten notes, and voice dictation transcripts captured at job sites.
              </li>
              <li>
                <strong>Price Book Data:</strong> Your catalog of equipment items, materials, categories, units, and unit pricing.
              </li>
              <li>
                <strong>Quote Records:</strong> Generated quotes, revision history, customer approval timestamps, and viewing logs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              3. Why We Collect Information
            </h2>
            <p className="mb-2">We process your information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#374151]">
              <li>To authenticate your account and securely isolate your company records.</li>
              <li>To provide AI-assisted draft estimates matching your price book.</li>
              <li>To generate shareable customer links and printable PDF quotes.</li>
              <li>To track quote approval and dashboard performance metrics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              4. Third-Party Service Providers and Data Processors
            </h2>
            <p className="mb-2">We share information only with trusted technical subprocessors required to operate the application:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#374151]">
              <li>
                <strong>Supabase:</strong> Provides managed PostgreSQL database with Row-Level Security, user authentication, and secure private storage for job photos.
              </li>
              <li>
                <strong>Vercel:</strong> Provides application hosting and serverless compute infrastructure.
              </li>
              <li>
                <strong>Google Gemini API:</strong> Processes technician job notes and uploaded equipment photos strictly to suggest draft quote line items and labor hours. Your data is not sold or used for public AI training models without authorization.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              5. Cookies and Local Storage
            </h2>
            <p>
              SiteQuote uses cookies solely for maintaining secure user authentication sessions. We do not use third-party advertising cookies or tracking pixels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              6. Data Security and Isolation
            </h2>
            <p>
              All customer and company data is isolated using PostgreSQL Row-Level Security (RLS) policies. One contractor can never view or modify data belonging to another contractor. Job photos are stored in private storage buckets and accessible only via time-limited signed URLs or authorized sessions. All network communication is encrypted in transit using HTTPS and TLS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              7. Data Retention and Deletion
            </h2>
            <p>
              We retain your account data, job photos, and quotes as long as your account is active. You may request complete export or deletion of your company account, customer data, and job photos at any time by contacting us at [CONTACT EMAIL].
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or your personal information, please email us at [CONTACT EMAIL].
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-[#E5E7EB] pt-6 text-sm text-[#4B5563]">
          <p>[COMPANY LEGAL NAME] - [COUNTRY/STATE]</p>
        </footer>
      </div>
    </main>
  );
}
