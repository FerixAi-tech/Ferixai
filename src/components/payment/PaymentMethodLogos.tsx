import Image from "next/image";

export default function PaymentMethodLogos({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-3xl flex-col items-center ${className}`}
      aria-label="Accepted payment methods"
    >
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
        <div className="flex h-[4.25rem] w-[11.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[13rem]">
          <Image
            src="/birlesik.png"
            alt="Apple Pay and Google Pay"
            width={360}
            height={96}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
          <Image
            src="/visa.png"
            alt="Visa"
            width={96}
            height={64}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
          <Image
            src="/mastercard.png"
            alt="Mastercard"
            width={96}
            height={64}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex h-[4.25rem] w-[8.5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[10rem]">
          <Image
            src="/ideal.png"
            alt="iDEAL"
            width={200}
            height={64}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        <div className="flex h-[4.25rem] w-[5rem] shrink-0 items-center justify-center sm:h-20 sm:w-[5.75rem]">
          <Image
            src="/stripe.png"
            alt="Stripe"
            width={140}
            height={64}
            className="max-h-full max-w-full scale-[1.45] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
