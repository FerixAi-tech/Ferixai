import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { APP_URL, SUPPORT_EMAIL } from "@/lib/constants/urls";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy · FerixAI",
  description:
    "FerixAI cancellation and refund terms, including our 14-day money-back guarantee.",
  alternates: {
    canonical: `${APP_URL}/refund-policy`,
  },
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Overview",
    body: (
      <>
        This Cancellation &amp; Refund Policy applies to all paid subscription
        plans offered by FerixAI through{" "}
        <Link href="/" className="text-teal-300 hover:underline">
          www.ferixai.com
        </Link>
        . By purchasing a plan, you agree to the terms below.
      </>
    ),
  },
  {
    heading: "2. Subscription Plans",
    body: (
      <>
        FerixAI offers monthly subscription plans (Starter, Growth, Premium,
        and Agency). Each plan is billed monthly and renews automatically at
        the end of every billing cycle unless cancelled. Promotional discounts
        (such as the £30 welcome code) apply to the first month only, unless
        stated otherwise.
      </>
    ),
  },
  {
    heading: "3. 14-Day Money-Back Guarantee",
    body: (
      <>
        We offer a{" "}
        <strong className="text-white">14-day money-back guarantee</strong> on
        your first purchase. If you are not satisfied with the service for any
        reason, contact us within 14 days of your initial payment and we will
        issue a full refund of the amount paid — no questions asked. The
        guarantee applies once per customer and covers the first billing cycle
        of your first plan.
      </>
    ),
  },
  {
    heading: "4. How to Cancel",
    body: (
      <>
        You can cancel your subscription at any time with one click from your
        dashboard, or by emailing us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-300 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        . Cancellation takes effect at the end of the current billing cycle.
        You will keep full access to your plan until that date, and you will
        not be charged again after cancellation.
      </>
    ),
  },
  {
    heading: "5. Refunds After the Guarantee Period",
    body: (
      <>
        After the 14-day guarantee period, payments for billing cycles that
        have already started are non-refundable, as content creation and
        publishing work begins immediately. However, if we fail to deliver the
        agreed service — for example, no content is prepared or published for
        your campaign — you may request a pro-rated or full refund for the
        affected billing cycle, which we will review in good faith.
      </>
    ),
  },
  {
    heading: "6. How Refunds Are Processed",
    body: (
      <>
        Approved refunds are issued to the original payment method within 5–10
        business days, depending on your bank or card provider. We will
        confirm by email once the refund has been processed.
      </>
    ),
  },
  {
    heading: "7. Promotional Codes and Free Credit",
    body: (
      <>
        Promotional codes and welcome credits have no cash value and cannot be
        refunded, exchanged, or transferred. If a refund is issued for an
        order where a promotional discount was applied, only the amount
        actually paid will be refunded.
      </>
    ),
  },
  {
    heading: "8. Service Interruptions",
    body: (
      <>
        If a significant service interruption caused by us prevents delivery
        of your campaign for an extended period, we will, at your choice,
        extend your plan by the affected duration or refund the affected
        portion of your payment.
      </>
    ),
  },
  {
    heading: "9. Contact Us",
    body: (
      <>
        For any cancellation or refund request, or questions about this
        policy, contact us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-300 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        . We aim to respond to all requests within 2 business days.
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#05070c]">
      <AppNav logoHref="/" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
          Legal
        </p>
        <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white sm:text-4xl">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="mt-3 text-sm text-[#64748b]">Last updated: 21 July 2026</p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-white">
                {section.heading}
              </h2>
              <div className="mt-2 text-sm leading-relaxed text-[#cbd5e1]">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <Link
            href="/"
            className="text-sm font-semibold text-teal-300 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
