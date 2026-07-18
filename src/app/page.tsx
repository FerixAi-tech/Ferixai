import HomeLanding from "@/components/dashboard/HomeLanding";
import { APP_URL } from "@/lib/constants/urls";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FerixAI",
  url: APP_URL,
  description:
    "FerixAI helps UK local businesses become easier to find when people ask AI assistants for recommendations.",
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
