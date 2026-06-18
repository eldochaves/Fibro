import { SeverityChart, type ChartPoint } from "./SeverityChart";
import {
  CRITERION_TYPE_LABEL,
  type QuestionnaireDef,
} from "@/lib/questionnaires";

export interface ResultRow {
  id: string;
  date: string;
  score: number; // valor numérico (para o gráfico)
  scoreText: string; // ex.: "12/31" ou "3/6 itens"
  by_doctor: boolean;
  line: string; // detalhamento (subescalas, categoria…)
  met: boolean | null; // critérios: atende? (null = não é critério)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Cartão didático com o resultado de UM questionário ao longo do tempo:
 * o que ele mede, o último resultado em destaque, se melhorou ou piorou,
 * o gráfico de evolução e o histórico completo.
 */
export function QuestionnaireResultCard({
  def,
  rows,
}: {
  def: QuestionnaireDef;
  rows: ResultRow[]; // ordem decrescente (rows[0] = mais recente)
}) {
  if (rows.length === 0) return null;

  const latest = rows[0];
  const prev = rows[1];
  // ACR 2016 tem escore numérico (FS) E é critério; demais critérios só têm "atende".
  const hasScore = def.kind === "avaliacao" || def.key === "acr2016";
  const hasMet = latest.met !== null;

  // Tendência (apenas para escores numéricos)
  let trend: { word: string; cls: string; arrow: string } | null = null;
  if (hasScore && prev) {
    if (latest.score === prev.score) {
      trend = { word: "estável", cls: "text-navy-400", arrow: "→" };
    } else {
      const increased = latest.score > prev.score;
      const better = def.higherIsBetter ? increased : !increased;
      trend = better
        ? { word: "melhorou", cls: "text-green-600", arrow: increased ? "↑" : "↓" }
        : { word: "piorou", cls: "text-red-600", arrow: increased ? "↑" : "↓" };
    }
  }

  const direction = !hasScore
    ? null
    : def.higherIsBetter
    ? "Quanto maior o escore, melhor."
    : "Quanto maior o escore, pior.";

  const typeBadge =
    def.kind === "criterio" && def.criterionType
      ? CRITERION_TYPE_LABEL[def.criterionType]
      : "Ferramenta de avaliação";

  const chart: ChartPoint[] = [...rows]
    .reverse()
    .map((r) => ({ date: r.date, score: r.score }));

  return (
    <div className="card">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base font-semibold text-navy-800">
            {def.icon} {def.name}
          </h3>
          <p className="mt-0.5 text-xs text-navy-400">
            {def.description}
            {direction && (
              <span className="font-medium text-navy-500"> {direction}</span>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">
          {typeBadge}
        </span>
      </div>

      {/* Último resultado em destaque */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-navy-50 px-4 py-3">
        {hasScore && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-navy-900">
              {latest.scoreText}
            </span>
            {trend && (
              <span className={`text-sm font-semibold ${trend.cls}`}>
                {trend.arrow} {trend.word}
              </span>
            )}
          </div>
        )}
        {hasMet && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              latest.met
                ? "bg-amber-100 text-amber-800"
                : "bg-navy-100 text-navy-500"
            }`}
          >
            {latest.met ? "Critérios atendidos" : "Não atende aos critérios"}
          </span>
        )}
        <span className="text-xs text-navy-400">
          Último: {fmtDate(latest.date)}
          {latest.by_doctor && " · preenchido pelo médico"}
          {prev && ` · anterior: ${fmtDate(prev.date)}`}
        </span>
      </div>
      {latest.line && (
        <p className="mt-2 text-xs text-navy-500">{latest.line}</p>
      )}

      {/* Gráfico de evolução */}
      {hasScore && (
        <div className="mt-4">
          <SeverityChart
            points={chart}
            maxScore={def.maxScore}
            caption={
              def.higherIsBetter ? "Maior = melhor" : "Maior = pior"
            }
          />
        </div>
      )}

      {/* Histórico completo */}
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-medium text-teal-700">
          Ver histórico completo ({rows.length})
        </summary>
        <ul className="mt-2 space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-navy-100 px-3 py-2"
            >
              <div className="text-xs text-navy-600">
                <span className="font-semibold text-navy-800">
                  {fmtDateTime(r.date)}
                </span>
                {r.by_doctor && (
                  <span className="ml-1 text-navy-400">· pelo médico</span>
                )}
                {r.line && <div className="text-navy-400">{r.line}</div>}
              </div>
              <span className="shrink-0 text-xs font-semibold text-teal-700">
                {r.met !== null
                  ? r.met
                    ? "Atende"
                    : "Não atende"
                  : r.scoreText}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
