"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BODY_AREAS,
  REGION_LABELS,
  GENERALIZED_REGIONS,
  SSS_SEVERITY_ITEMS,
  SSS_SEVERITY_OPTIONS,
  SSS_SYMPTOM_ITEMS,
  evaluate,
  type FibroAnswers,
  type Region,
} from "@/lib/acr2016";
import { saveAssessment } from "@/app/actions";

const STEPS = [
  "Áreas de dor",
  "Severidade",
  "Outros sintomas",
  "Resultado",
] as const;

export function QuestionarioForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [painAreas, setPainAreas] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState({ fadiga: -1, sono: -1, cognitivo: -1 });
  const [symptoms, setSymptoms] = useState({
    dor_cabeca: false,
    dor_abdome: false,
    depressao: false,
  });
  const [threeMonths, setThreeMonths] = useState<boolean | null>(null);

  const answers: FibroAnswers = useMemo(
    () => ({
      painAreas: Array.from(painAreas),
      severity: {
        fadiga: Math.max(0, severity.fadiga),
        sono: Math.max(0, severity.sono),
        cognitivo: Math.max(0, severity.cognitivo),
      },
      symptoms,
      threeMonths: threeMonths === true,
    }),
    [painAreas, severity, symptoms, threeMonths]
  );

  const result = useMemo(() => evaluate(answers), [answers]);

  // Áreas agrupadas por região
  const areasByRegion = useMemo(() => {
    const map = new Map<Region, typeof BODY_AREAS>();
    for (const area of BODY_AREAS) {
      if (!map.has(area.region)) map.set(area.region, []);
      map.get(area.region)!.push(area);
    }
    return map;
  }, []);

  function toggleArea(id: string) {
    setPainAreas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const severityComplete =
    severity.fadiga >= 0 && severity.sono >= 0 && severity.cognitivo >= 0;
  const symptomsComplete = threeMonths !== null;

  function canAdvance() {
    if (step === 1) return severityComplete;
    if (step === 2) return symptomsComplete;
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await saveAssessment(answers);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
    } else {
      setError(res.error ?? "Não foi possível salvar. Tente novamente.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Progresso */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
          <span>
            Etapa {step + 1} de {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ETAPA 0 — Áreas de dor (WPI) */}
      {step === 0 && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">Onde você sentiu dor?</h2>
            <p className="text-sm text-slate-600">
              Marque todas as áreas onde você sentiu dor{" "}
              <strong>na última semana</strong>.
            </p>
          </div>

          {GENERALIZED_REGIONS.map((region) => (
            <div key={region} className="card">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {REGION_LABELS[region]}
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {areasByRegion.get(region)?.map((area) => {
                  const active = painAreas.has(area.id);
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => toggleArea(area.id)}
                      aria-pressed={active}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          active
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {active && <CheckIcon />}
                      </span>
                      {area.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-center text-sm text-slate-500">
            Áreas marcadas: <strong>{painAreas.size}</strong> de 19
          </p>
        </section>
      )}

      {/* ETAPA 1 — Severidade (SSS parte 1) */}
      {step === 1 && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">Como você tem se sentido?</h2>
            <p className="text-sm text-slate-600">
              Pensando na <strong>última semana</strong>, indique a intensidade
              de cada sintoma.
            </p>
          </div>

          {SSS_SEVERITY_ITEMS.map((item) => (
            <div key={item.id} className="card">
              <h3 className="text-sm font-semibold text-slate-800">
                {item.label}
              </h3>
              <p className="mb-3 text-xs text-slate-500">{item.description}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SSS_SEVERITY_OPTIONS.map((opt) => {
                  const active = severity[item.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setSeverity((s) => ({ ...s, [item.id]: opt.value }))
                      }
                      aria-pressed={active}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ETAPA 2 — Outros sintomas (SSS parte 2) + duração */}
      {step === 2 && (
        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-bold">Outros sintomas</h2>
            <p className="text-sm text-slate-600">
              Nos <strong>últimos 6 meses</strong>, você teve:
            </p>
          </div>

          <div className="card space-y-2">
            {SSS_SYMPTOM_ITEMS.map((item) => {
              const active = symptoms[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSymptoms((s) => ({ ...s, [item.id]: !s[item.id] }))
                  }
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {active && <CheckIcon />}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">
              Esses sintomas estão presentes, em nível parecido, há pelo menos 3
              meses?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: true, label: "Sim" },
                { v: false, label: "Não" },
              ].map((opt) => {
                const active = threeMonths === opt.v;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setThreeMonths(opt.v)}
                    aria-pressed={active}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ETAPA 3 — Resultado */}
      {step === 3 && (
        <section className="space-y-5">
          {!saved ? (
            <>
              <div>
                <h2 className="text-lg font-bold">Confira e finalize</h2>
                <p className="text-sm text-slate-600">
                  Revise o resumo abaixo e toque em salvar para enviar ao seu
                  médico.
                </p>
              </div>
              <ResultCard result={result} preview />
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                onClick={handleSave}
                className="btn-primary w-full"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar avaliação"}
              </button>
            </>
          ) : (
            <>
              <div className="card flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
                  ✅
                </div>
                <h2 className="text-lg font-bold">Avaliação enviada!</h2>
                <p className="text-sm text-slate-600">
                  Suas respostas foram salvas. Você pode mostrar este resultado
                  ao seu médico.
                </p>
              </div>
              <ResultCard result={result} />
              <button
                onClick={() => {
                  router.push("/historico");
                  router.refresh();
                }}
                className="btn-primary w-full"
              >
                Ver meu histórico
              </button>
            </>
          )}
        </section>
      )}

      {/* Navegação */}
      {!saved && (
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="btn-outline flex-1"
            >
              Voltar
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button
              type="button"
              onClick={() => canAdvance() && setStep((s) => s + 1)}
              className="btn-primary flex-1"
              disabled={!canAdvance()}
            >
              Continuar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  result,
  preview = false,
}: {
  result: ReturnType<typeof evaluate>;
  preview?: boolean;
}) {
  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="WPI (Dor generalizada)" value={`${result.wpi} / 19`} />
        <Metric label="SSS (Severidade)" value={`${result.sss} / 12`} />
        <Metric
          label="Regiões com dor"
          value={`${result.regionsWithPain} / 5`}
        />
        <Metric
          label="Escore total (FS)"
          value={`${result.wpi + result.sss} / 31`}
        />
      </div>

      <div
        className={`rounded-xl px-4 py-3 text-sm font-medium ${
          result.meetsCriteria
            ? "bg-amber-50 text-amber-800"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {result.meetsCriteria
          ? "Os critérios ACR 2016 para fibromialgia foram ATENDIDOS nesta avaliação."
          : "Os critérios ACR 2016 NÃO foram atendidos nesta avaliação."}
      </div>

      <ul className="space-y-1 text-xs text-slate-500">
        <li>
          {result.conditions.painThreshold ? "✓" : "✗"} Limiar de dor/severidade
        </li>
        <li>
          {result.conditions.generalizedPain ? "✓" : "✗"} Dor em ≥ 4 das 5
          regiões
        </li>
        <li>{result.conditions.duration ? "✓" : "✗"} Sintomas há ≥ 3 meses</li>
      </ul>

      {preview && (
        <p className="text-xs text-slate-400">
          Este resultado é apenas uma triagem e não constitui diagnóstico. Seu
          médico fará a avaliação final.
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
