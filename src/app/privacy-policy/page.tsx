import type { Metadata } from "next";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { APP_URL, SUPPORT_EMAIL } from "@/lib/constants/urls";

export const metadata: Metadata = {
  title: "Privacy Policy · FerixAI",
  description:
    "Learn how FerixAI collects, uses, and protects your personal data.",
  alternates: {
    canonical: `${APP_URL}/privacy-policy`,
  },
};

const SECTIONS: { heading: string; body: React.ReactNode }[] = [
  {
    heading: "1. Who We Are",
    body: (
      <>
        FerixAI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the
        website{" "}
        <Link href="/" className="text-teal-300 hover:underline">
          www.ferixai.com
        </Link>{" "}
        and provides AI visibility and local content publishing services for
        businesses. This Privacy Policy explains how we collect, use, store,
        and protect your personal data when you use our website and services.
      </>
    ),
  },
  {
    heading: "2. Information We Collect",
    body: (
      <>
        We collect the following categories of information:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Account information:</strong> your
            full name, email address, and password when you create an account.
          </li>
          <li>
            <strong className="text-white">Business information:</strong>{" "}
            business name, category, town or city, and optional product
            descriptions you provide when creating a campaign.
          </li>
          <li>
            <strong className="text-white">Usage data:</strong> pages visited,
            actions taken, and technical data such as browser type and device
            information collected through cookies and similar technologies.
          </li>
          <li>
            <strong className="text-white">Communications:</strong> messages
            you send to our support team.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "3. How We Use Your Information",
    body: (
      <>
        We use your information to:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>provide, operate, and improve our services;</li>
          <li>
            create and publish campaign content for your business as requested
            by you;
          </li>
          <li>manage your account, subscriptions, and promo codes;</li>
          <li>respond to your support requests;</li>
          <li>send essential service communications;</li>
          <li>comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. Legal Basis for Processing",
    body: (
      <>
        We process your personal data on the following legal bases: the
        performance of our contract with you, your consent where required,
        our legitimate interests in operating and improving our services, and
        compliance with legal obligations under applicable data protection
        laws, including the UK GDPR and the Data Protection Act 2018.
      </>
    ),
  },
  {
    heading: "5. Sharing Your Information",
    body: (
      <>
        We do not sell your personal data. We may share your information with
        trusted service providers that help us operate our platform (such as
        hosting, database, and content publishing providers), strictly for the
        purposes described in this policy and under appropriate data
        protection agreements. Published campaign content (business name,
        category, city, and article content) is public by design, as the core
        purpose of the service is to increase your business visibility.
      </>
    ),
  },
  {
    heading: "6. Data Retention",
    body: (
      <>
        We retain your account data for as long as your account is active.
        Campaign content remains published for the duration of your plan and
        may be removed upon request. You may request deletion of your account
        and associated personal data at any time by contacting us.
      </>
    ),
  },
  {
    heading: "7. Cookies",
    body: (
      <>
        We use essential cookies to keep you signed in and to operate core
        site functionality, and analytics cookies to understand how the site
        is used so we can improve it. You can control cookies through your
        browser settings.
      </>
    ),
  },
  {
    heading: "8. Data Security",
    body: (
      <>
        We implement appropriate technical and organisational measures to
        protect your personal data, including encrypted connections (HTTPS),
        access controls, and secure infrastructure provided by our hosting
        partners. No method of transmission over the internet is 100% secure,
        but we work to protect your data using industry best practices.
      </>
    ),
  },
  {
    heading: "9. Your Rights",
    body: (
      <>
        Under applicable data protection law, you have the right to access,
        correct, delete, or port your personal data, to restrict or object to
        its processing, and to withdraw consent at any time. To exercise any
        of these rights, contact us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-300 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        . You also have the right to lodge a complaint with the Information
        Commissioner&apos;s Office (ICO) in the UK.
      </>
    ),
  },
  {
    heading: "10. Children's Privacy",
    body: (
      <>
        Our services are intended for businesses and are not directed at
        individuals under the age of 18. We do not knowingly collect personal
        data from children.
      </>
    ),
  },
  {
    heading: "11. Changes to This Policy",
    body: (
      <>
        We may update this Privacy Policy from time to time. Any changes will
        be posted on this page with an updated revision date. Continued use of
        the service after changes means you accept the updated policy.
      </>
    ),
  },
  {
    heading: "12. Contact Us",
    body: (
      <>
        If you have any questions about this Privacy Policy or how we handle
        your data, contact us at{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-teal-300 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        .
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#05070c]">
      <AppNav logoHref="/" />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
          Legal
        </p>
        <h1 className="lf-orbitron mt-2 text-3xl font-bold text-white sm:text-4xl">
          Privacy Policy
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
