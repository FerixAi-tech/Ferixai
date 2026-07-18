"use client";

const VALUES = [
  {
    title: "Instant AI Search Indexing",
    description:
      "We sync your latest business hours, location, and services directly into the data pipelines that ChatGPT and Gemini use to answer local queries.",
  },
  {
    title: "Zero Manual Effort",
    description:
      "Just enter your business name. Our background system automatically scans your reviews and footprint to highlight your best features to AI bots.",
  },
  {
    title: "Beat the Competition",
    description:
      "While other shops are still wasting thousands on old-school SEO, FerixAI puts you at the top of next-generation voice and conversational searches.",
  },
  {
    title: "Proof of Value Reports",
    description:
      "See your progress live. We provide screenshots and verification reports showing exactly how AI assistants recommend your business in real-time.",
  },
] as const;

const SECTORS = [
  "Restaurants & Cafes",
  "Health & Clinics",
  "Property",
  "Legal & Consulting",
  "Home Services",
  "Retail",
  "Automotive",
  "Education",
  "Travel & Hotels",
  "Manufacturing",
] as const;

export default function LandingCorporateSections() {
  return (
    <>
      <section className="pb-16 pt-4">
        <div className="lf-animate-in mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Why FerixAI
          </p>
          <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
            A calm, professional way to get found
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
            No jargon. No inflated claims. Just a structured system that helps
            people understand what your business offers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((item) => (
            <article
              key={item.title}
              className="group relative overflow-hidden rounded-[18px] border border-violet-950/70 p-[1px] transition hover:-translate-y-0.5 hover:border-violet-800/60 hover:shadow-[0_12px_32px_rgba(24,10,45,0.45)]"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#241838_0%,#1a122c_40%,#120c22_75%,#0c0818_100%)] opacity-95"
                aria-hidden
              />
              <div className="relative h-full rounded-[17px] bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6">
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-16 pt-4">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[rgba(8,12,18,0.95)] to-emerald-500/5 p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Sector coverage
              </p>
              <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
                Made for local service businesses
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#94a3b8]">
                From clinics and cafes to trades and professional services —
                FerixAI adapts content to your category and town.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <span
                  key={sector}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100"
                >
                  {sector}
                </span>
              ))}
              <span className="rounded-full border border-emerald-400/45 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-200">
                +14 more categories
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
