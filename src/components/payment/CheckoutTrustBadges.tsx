export default function CheckoutTrustBadges() {
  const items = [
    {
      icon: "🔒",
      text: "256-bit SSL Encrypted & Bank-Grade Security via Stripe",
    },
    {
      icon: "💳",
      text: "We do not store your card details. Your payment credentials are handled directly and securely by Stripe.",
    },
    {
      icon: "🛡️",
      text: "14-Day Money-Back Guarantee — If you're not satisfied, get a full refund with no questions asked.",
    },
    {
      icon: "⚡",
      text: "Cancel Anytime in 1-Click from your dashboard.",
    },
  ] as const;

  return (
    <div className="space-y-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
      {items.map((item) => (
        <p
          key={item.text}
          className="flex items-start gap-2.5 text-xs leading-relaxed text-[#cbd5e1] sm:text-sm"
        >
          <span className="mt-0.5 shrink-0 text-base leading-none" aria-hidden>
            {item.icon}
          </span>
          <span>{item.text}</span>
        </p>
      ))}
    </div>
  );
}
