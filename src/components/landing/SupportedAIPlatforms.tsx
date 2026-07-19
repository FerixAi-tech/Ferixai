"use client";

import Image from "next/image";

const PLATFORMS = [
  {
    name: "ChatGPT",
    query: "Where can I find the best bakery near me?",
    note: "FerixAI structures your data so ChatGPT answers with your shop name and top reviews.",
  },
  {
    name: "Gemini",
    query: "Recommend a reliable car repair shop in town.",
    note: "We feed Google’s AI ecosystem to make sure Gemini puts you at the top of local recommendations.",
  },
  {
    name: "Claude",
    query: "Looking for a quiet cafe to work in Soho.",
    note: "We optimise your unique features so Claude gives detailed, style-based recommendations about your business.",
  },
] as const;

const SUPPORTED_AIS = [
  {
    name: "ChatGPT",
    by: "OpenAI",
    blurb: "Conversational search & local recommendations",
    logo: "/chatgpt.png",
  },
  {
    name: "Gemini",
    by: "Google",
    blurb: "Maps-aware answers across Google’s AI stack",
    logo: "/gemini.png",
  },
  {
    name: "Claude",
    by: "Anthropic",
    blurb: "Detailed, preference-aware local advice",
    logo: "/claude.png",
  },
] as const;

export default function SupportedAIPlatforms() {
  return (
    <section className="pb-16 pt-4">
      <div className="lf-animate-in mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Built for real questions
        </p>
        <h2 className="lf-orbitron mt-3 text-2xl font-bold text-white sm:text-3xl">
          When people ask AI, will they hear about you?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
          Every day, customers ask ChatGPT, Gemini and Claude for local
          recommendations. FerixAI helps your business show up in those answers
          — before your competitors do.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <article
            key={platform.name}
            className="rounded-[18px] border border-violet-950/70 bg-[linear-gradient(165deg,#120c1e_0%,#0e0a18_45%,#090610_100%)] p-6 transition hover:-translate-y-0.5 hover:border-violet-800/60 hover:shadow-[0_12px_32px_rgba(24,10,45,0.45)]"
          >
            <h3 className="text-lg font-bold text-white">{platform.name}</h3>
            <p className="mt-3 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-3 py-2.5 text-sm italic leading-relaxed text-emerald-100">
              “{platform.query}”
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white">
              {platform.note}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-[22px] border border-teal-500/20 bg-[linear-gradient(165deg,rgba(14,165,164,0.08),#0a0712_45%,#05070c_100%)] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300/90">
            Supported AI platforms
          </p>
          <h3 className="lf-orbitron mt-2 text-xl font-bold text-white sm:text-2xl">
            Built for the assistants your customers already use
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
            FerixAI prepares your local business presence for the major AI
            recommendation engines — so you stay visible wherever people ask.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {SUPPORTED_AIS.map((ai) => (
            <div
              key={ai.name}
              className="flex flex-col items-center rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-5 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 p-2 shadow-[0_0_24px_rgba(45,212,191,0.12)] sm:h-20 sm:w-20">
                <Image
                  src={ai.logo}
                  alt={`${ai.name} logo`}
                  width={72}
                  height={72}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="lf-orbitron text-lg font-bold text-white">
                {ai.name}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-300/80">
                {ai.by}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#94a3b8]">
                {ai.blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
