"use client";

const HOTSPOTS = [
  { id: "uk", label: "United Kingdom", x: 48.2, y: 32.5, delay: "0s" },
  { id: "usa", label: "United States", x: 22.5, y: 38, delay: "0.35s" },
  { id: "ca", label: "Canada", x: 24, y: 26, delay: "0.7s" },
  { id: "tr", label: "Turkey", x: 56.5, y: 38.5, delay: "1.05s" },
  { id: "au", label: "Australia", x: 82, y: 72, delay: "1.4s" },
] as const;

function NetworkHotspot({
  x,
  y,
  label,
  delay,
}: {
  x: number;
  y: number;
  label: string;
  delay: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      aria-hidden
    >
      <span
        className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/35 animate-ping"
        style={{ animationDelay: delay }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/50 blur-[1px]"
        style={{ animationDelay: delay }}
      />
      <span className="relative block h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,1),0_0_32px_rgba(16,185,129,0.75)]" />
      <span className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-400/30 bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-100/95 backdrop-blur-sm sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

/** Dark-themed world map with glowing green coverage dots. */
export default function GlobalAiNetwork() {
  return (
    <section
      aria-labelledby="global-ai-network-heading"
      className="overflow-hidden rounded-[22px] border border-emerald-500/20 bg-[linear-gradient(165deg,rgba(16,185,129,0.08),#0a0712_40%,#05070c_100%)] p-5 sm:p-8"
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/90">
          Live coverage
        </p>
        <h3
          id="global-ai-network-heading"
          className="lf-orbitron mt-2 text-xl font-bold text-white sm:text-2xl"
        >
          Global AI Network Active
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8] sm:text-base">
          We are continuously deploying active local advertising and SEO
          campaigns across 5 countries including the UK, USA, Canada, Turkey,
          and Australia. Delivering high-impact visibility for local businesses
          worldwide.
        </p>
      </div>

      <div className="relative mx-auto mt-8 aspect-[2/1] w-full max-w-4xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 45%, transparent 85%)",
          }}
        />

        <svg
          viewBox="0 0 1000 500"
          className="h-full w-full text-emerald-400/25"
          role="img"
          aria-label="World map highlighting United Kingdom, United States, Canada, Turkey, and Australia"
        >
          <defs>
            <linearGradient id="landFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(52,211,153,0.2)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0.12)" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            fill="url(#landFill)"
            stroke="currentColor"
            strokeWidth="1"
            filter="url(#softGlow)"
          >
            {/* North America */}
            <path d="M90 95 L160 70 L240 85 L280 120 L300 170 L270 230 L220 250 L180 220 L140 240 L110 200 L95 150 Z" />
            {/* South America */}
            <path d="M250 270 L290 275 L310 340 L295 410 L260 430 L240 380 L235 320 Z" />
            {/* Europe / UK cluster */}
            <path d="M460 110 L510 105 L545 125 L540 165 L500 175 L465 155 Z" />
            {/* Africa */}
            <path d="M480 200 L540 195 L575 250 L560 340 L510 360 L470 300 Z" />
            {/* Asia */}
            <path d="M560 90 L720 80 L780 130 L760 200 L680 220 L600 180 L555 140 Z" />
            {/* Turkey / Anatolia accent */}
            <path d="M545 175 L585 170 L600 185 L585 200 L550 195 Z" />
            {/* Australia */}
            <path d="M760 330 L860 320 L900 360 L880 410 L800 420 L755 380 Z" />
          </g>

          <g
            fill="none"
            stroke="rgba(52,211,153,0.35)"
            strokeWidth="1"
            strokeDasharray="4 6"
          >
            <path d="M225 190 C 320 80, 400 90, 482 162" />
            <path d="M240 130 C 380 40, 560 60, 482 162" />
            <path d="M482 162 C 520 175, 540 180, 565 185" />
            <path d="M565 185 C 650 220, 740 290, 820 360" />
            <path d="M225 190 C 420 280, 620 320, 820 360" />
          </g>
        </svg>

        {HOTSPOTS.map((spot) => (
          <NetworkHotspot
            key={spot.id}
            x={spot.x}
            y={spot.y}
            label={spot.label}
            delay={spot.delay}
          />
        ))}
      </div>

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {HOTSPOTS.map((spot) => (
          <li
            key={spot.id}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#94a3b8]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            </span>
            {spot.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
