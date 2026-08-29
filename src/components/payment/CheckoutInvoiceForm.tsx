"use client";

import DarkSelect from "@/components/ui/DarkSelect";
import { listStreetAreasForCity } from "@/lib/constants/city-streets";

export default function CheckoutInvoiceForm({
  businessName,
  email,
  emirateCity,
  streetArea,
  trnNumber,
  onStreetAreaChange,
  onTrnNumberChange,
  compact = false,
}: {
  businessName: string;
  email: string;
  emirateCity: string;
  streetArea: string;
  trnNumber: string;
  onStreetAreaChange: (value: string) => void;
  onTrnNumberChange: (value: string) => void;
  compact?: boolean;
}) {
  const streetOptions = listStreetAreasForCity(emirateCity).map((area) => ({
    value: area,
    label: area,
  }));

  return (
    <div
      className={
        compact
          ? "space-y-4"
          : "mt-6 space-y-4 border-t border-white/10 pt-5"
      }
      lang="en"
    >
      <div>
        <h4 className="text-sm font-bold text-white">Invoice details</h4>
        <p className="mt-1 text-xs text-[#64748b]">
          Required for your tax invoice. Pre-filled fields come from your
          account and campaign setup.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            readOnly
            className="lf-input cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-[#cbd5e1]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="lf-input cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-[#cbd5e1]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
            City
          </label>
          <input
            type="text"
            value={emirateCity}
            readOnly
            className="lf-input cursor-not-allowed border-white/[0.08] bg-white/[0.03] text-[#cbd5e1]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
            Street / Area Address <span className="text-red-400">*</span>
          </label>
          <DarkSelect
            value={streetArea}
            onChange={onStreetAreaChange}
            placeholder="Select street or area"
            options={streetOptions}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[#94a3b8]">
            TRN Number{" "}
            <span className="font-normal text-[#64748b]">(optional)</span>
          </label>
          <input
            type="text"
            value={trnNumber}
            onChange={(e) => onTrnNumberChange(e.target.value)}
            placeholder="Tax Registration Number"
            maxLength={20}
            className="lf-input border-white/[0.12] bg-white/[0.04]"
          />
        </div>
      </div>
    </div>
  );
}
