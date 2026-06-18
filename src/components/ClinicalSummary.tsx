/** Resumo clínico: últimos escores por questionário + tendência. */
export interface SummaryMetric {
  label: string;
  value: number;
  max: number;
  prev: number | null; // valor anterior (para tendência)
  highlight?: boolean; // ex.: critérios ACR atendidos
  higherIsBetter?: boolean; // ex.: KOOS/HOOS (maior = melhor)
}

export function ClinicalSummary({ metrics }: { metrics: SummaryMetric[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((m) => {
        // Tendência: "improved" = melhorou, "worsened" = piorou, "flat".
        // Na maioria MAIOR = pior; em KOOS/HOOS MAIOR = melhor.
        let trend: "improved" | "worsened" | "flat" | null = null;
        if (m.prev !== null) {
          if (m.value === m.prev) trend = "flat";
          else {
            const increased = m.value > m.prev;
            const better = m.higherIsBetter ? increased : !increased;
            trend = better ? "improved" : "worsened";
          }
        }
        const arrow =
          trend === "flat"
            ? "→"
            : trend === null
            ? ""
            : m.value > (m.prev ?? m.value)
            ? "↑"
            : "↓";
        return (
          <div
            key={m.label}
            className={`rounded-2xl border p-3 ${
              m.highlight
                ? "border-amber-200 bg-amber-50"
                : "border-navy-100 bg-white"
            }`}
          >
            <div className="text-xs font-medium text-navy-400">{m.label}</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-navy-900">{m.value}</span>
              <span className="text-xs text-navy-300">/{m.max}</span>
              {trend === "improved" && (
                <span className="text-sm font-semibold text-green-600" title="Melhorou">
                  {arrow}
                </span>
              )}
              {trend === "worsened" && (
                <span className="text-sm font-semibold text-red-600" title="Piorou">
                  {arrow}
                </span>
              )}
              {trend === "flat" && (
                <span className="text-sm text-navy-300" title="Estável">
                  →
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
