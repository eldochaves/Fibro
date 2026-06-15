"use client";

import { scaleColor } from "@/lib/scaleColor";

/** Linha de item com opções tipo Likert (0..N). Usada por CSI e PCS. */
export function LikertRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: string[];
  onChange: (v: number) => void;
}) {
  const max = options.length - 1;
  return (
    <div className="border-t border-navy-100 pt-3 first:border-0 first:pt-0">
      <div className="mb-2 text-sm font-medium text-navy-800">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, v) => {
          const active = value === v;
          const color = scaleColor(v, max);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={active}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              style={
                active
                  ? { backgroundColor: color, borderColor: color, color: "#fff" }
                  : { borderColor: "#dbe6ee", color: "#334155" }
              }
            >
              <span className="mr-1 font-bold">{v}</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
