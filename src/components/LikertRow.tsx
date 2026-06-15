"use client";

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
  return (
    <div className="border-t border-navy-100 pt-3 first:border-0 first:pt-0">
      <div className="mb-2 text-sm font-medium text-navy-800">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, v) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={active}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
              }`}
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
