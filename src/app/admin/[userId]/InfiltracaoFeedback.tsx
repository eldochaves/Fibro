import { SeverityChart, type ChartPoint } from "@/components/SeverityChart";

export interface InfiltracaoRow {
  id: string;
  created_at: string;
  by_doctor: boolean | null;
  summary: Record<string, unknown> | null;
}

/**
 * Mostra os feedbacks pós-infiltração agrupados por LOCAL infiltrado —
 * um mini-painel por tendinite, com a evolução da satisfação e os detalhes
 * de cada envio (impressão de melhora, dor, recomendação, depoimento e
 * autorização para compartilhar).
 */
export function InfiltracaoFeedback({ rows }: { rows: InfiltracaoRow[] }) {
  if (rows.length === 0) return null;

  // Agrupa por local (summary.site)
  const bySite = new Map<string, InfiltracaoRow[]>();
  for (const r of rows) {
    const site = (r.summary?.site as string) || "Geral";
    if (!bySite.has(site)) bySite.set(site, []);
    bySite.get(site)!.push(r);
  }

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 border-l-4 border-purple-500 pl-2 font-display text-lg font-semibold text-purple-900">
        <span>💉</span>
        Feedback pós-infiltração
      </h2>

      <div className="space-y-4">
        {[...bySite.entries()].map(([site, list]) => {
          const chart: ChartPoint[] = [...list]
            .reverse()
            .map((r) => ({
              date: r.created_at,
              score: Number(r.summary?.satisfacao ?? 0),
            }));
          return (
            <div key={site} className="card">
              <h3 className="font-display text-base font-semibold text-navy-800">
                {site}{" "}
                <span className="text-xs font-normal text-navy-400">
                  ({list.length})
                </span>
              </h3>

              {chart.length >= 1 && (
                <div className="mt-3">
                  <SeverityChart
                    points={chart}
                    maxScore={10}
                    caption="Satisfação (maior = melhor)"
                  />
                </div>
              )}

              <ul className="mt-3 space-y-3">
                {list.map((r) => {
                  const s = r.summary ?? {};
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl border border-navy-100 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-800">
                          {fmt(r.created_at)}
                          {r.by_doctor && (
                            <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">
                              👨‍⚕️ pelo médico
                            </span>
                          )}
                        </span>
                        <span className="chip-teal shrink-0">
                          Satisfação {String(s.satisfacao ?? "–")}/10
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-navy-500">
                        {s.pgic ? <span>Evolução: {String(s.pgic)}</span> : null}
                        {s.inicio ? <span>Melhora: {String(s.inicio)}</span> : null}
                        <span>Dor: {String(s.dor ?? "–")}/10</span>
                        {s.recomenda ? (
                          <span>Recomenda: {String(s.recomenda)}</span>
                        ) : null}
                        {s.efeito ? (
                          <span className="text-amber-700">
                            Efeito indesejado
                            {s.efeito_desc ? `: ${String(s.efeito_desc)}` : ""}
                          </span>
                        ) : null}
                      </div>

                      {s.depoimento ? (
                        <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-navy-700">
                          “{String(s.depoimento)}”
                        </p>
                      ) : null}

                      <div className="mt-2">
                        {s.consent ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            ✔ Autoriza compartilhar{" "}
                            {s.consent_nome ? "(com nome)" : "(anônimo)"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-500">
                            Não autoriza compartilhar
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
