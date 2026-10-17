import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for SiteQuote.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-8 text-[#111827]">
      <div className="mx-auto max-w-[720px]">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center text-sm font-medium text-[#1D4ED8] hover:underline mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <header className="border-b border-[#E5E7EB] pb-6 mb-6">
          <h1 className="text-2xl font-bold text-[#111827] sm:text-3xl">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-[#4B5563]">
            Effective Date: October 18, 2026. Draft for review.
          </p>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-[#111827]">
          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By creating an account or using SiteQuote, provided by [COMPANY LEGAL NAME] (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to these Terms and Conditions. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              2. Permitted Use
            </h2>
            <p>
              SiteQuote is designed for licensed tradespeople, contractors, and business operators to prepare quotes for trade and maintenance services. You agree not to misuse the service, reverse engineer its code, submit unlawful or malicious content, or attempt unauthorized access to other contractor accounts.
            </p>
          </section>

          <section className="bg-[#F3F4F6] p-4 rounded-xl border border-[#E5E7EB]">
            <h2 className="text-lg font-bold text-[#111827] mb-2">
              3. Mandatory Human Review of AI Quotes
            </h2>
            <p className="text-sm font-medium leading-relaxed">
              SiteQuote utilizes artificial intelligence models to assist in drafting price estimates based on photos and technician notes. AI suggestions are drafts only. You are solely responsible for reviewing, verifying, editing, and confirming every line item, quantity, labor hour, part suitability, and price before sending any quote to a homeowner or customer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              4. Disclaimer of AI Accuracy and Warranties
            </h2>
            <p>
              The service is provided &quot;as is&quot; and &quot;as available&quot;. We make no representations or warranties regarding the completeness, accuracy, or trade suitability of AI-suggested estimates or calculations. You acknowledge that AI models may make errors or misinterpret photographs and notes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              5. Customer and Job Data Ownership
            </h2>
            <p>
              You retain all rights and ownership of the job photos, notes, customer records, and price books you upload. You grant us a limited license to store, process, and transmit this content solely to provide the services described.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, [COMPANY LEGAL NAME] will not be liable for any indirect, incidental, special, or consequential damages, lost profits, lost jobs, customer disputes, or pricing discrepancies arising from your use of the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              7. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior. You may terminate your account at any time by contacting [CONTACT EMAIL].
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              8. Governing Law
            </h2>
            <p>
              These Terms will be governed by and construed in accordance with the laws of [COUNTRY/STATE], without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111827] mb-2">
              9. Contact
            </h2>
            <p>
              For legal inquiries regarding these terms, please contact [CONTACT EMAIL].
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
