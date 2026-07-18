"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

export default function DarkSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="lf-input flex w-full items-center justify-between gap-3 text-left"
      >
        <span className={selected ? "text-white" : "text-[#64748b]"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#94a3b8] transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute bottom-full z-50 mb-2 max-h-60 w-full overflow-auto rounded-xl border border-violet-500/30 bg-[#120c1e] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full px-4 py-2.5 text-left text-sm transition ${
                !value
                  ? "bg-violet-500/25 text-white"
                  : "text-[#94a3b8] hover:bg-violet-500/15 hover:text-white"
              }`}
            >
              {placeholder}
            </button>
          </li>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-4 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-violet-500/30 text-white"
                      : "text-[#e2e8f0] hover:bg-violet-500/15 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
