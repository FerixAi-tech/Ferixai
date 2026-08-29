import type { Metadata } from "next";
import HomeLanding from "@/components/dashboard/HomeLanding";
import { APP_URL } from "@/lib/constants/urls";

export const metadata: Metadata = {
  title: "FerixAI — Visibility for Dutch businesses",
  description:
    "FerixAI helps Dutch local businesses become easier to find when people ask AI assistants for recommendations.",
  keywords: [
    "FerixAI",
    "Netherlands business visibility",
    "Dutch local SEO",
    "AI recommendations",
    "Amsterdam business marketing",
  ],
  openGraph: {
    title: "FerixAI — Visibility for Dutch businesses",
    description:
      "Make your Dutch business the #1 AI recommendation on ChatGPT, Gemini & Claude.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FerixAI",
  url: APP_URL,
  logo: `${APP_URL}/logo.png`,
  description:
    "FerixAI helps Dutch local businesses become easier to find when people ask AI assistants for recommendations.",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string }>;
}) {
  const params = await searchParams;
  const openSignup = params.signup === "1";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <div className="relative min-h-screen overflow-x-hidden bg-[#05070c]">
        <HomeLanding openSignup={openSignup} />
      </div>
    </>
  );
}
