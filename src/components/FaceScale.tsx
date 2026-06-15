"use client";

import { scaleColor } from "@/lib/scaleColor";

function Face({ color, mood }: { color: string; mood: "happy" | "neutral" | "sad" }) {
  const mouth =
    mood === "happy"
      ? "M13 24 Q20 32 27 24"
      : mood === "sad"
      ? "M13 28 Q20 20 27 28"
      : "M13 26 H27";
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9">
      <circle cx="20" cy="20" r="17" fill={color} opacity="0.18" />
      <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="14" cy="16" r="2.2" fill={color} />
      <circle cx="26" cy="16" r="2.2" fill={color} />
      <path d={mouth} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function moodFor(value: number, max: number): "happy" | "neutral" | "sad" {
  const r = value / max;
  if (r <= 0.34) return "happy";
  if (r <= 0.67) return "neutral";
  return "sad";
}

export function FaceScale({
  value,
  max,
  options,
  onChange,
}: {
  value: number;
  max: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((opt) => {
        const active = value === opt.value;
        const color = scaleColor(opt.value, max);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center text-xs font-medium transition ${
              active
                ? "border-transparent text-navy-900 ring-2"
                : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
            }`}
            style={
              active
                ? { backgroundColor: `${color}1f`, boxShadow: `0 0 0 2px ${color}` }
                : undefined
            }
          >
            <Face color={color} mood={moodFor(opt.value, max)} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export { Face, moodFor };
