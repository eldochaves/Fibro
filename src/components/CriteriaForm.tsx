"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeCriteria,
  criteriaAllItems,
  isCriteriaComplete,
  type CriteriaAnswers,
  type CritItem,
} from "@/lib/criteria";
import { CRITERIA_DEFS } from "@/lib/criteria";
import { saveCriteria, adminSaveCriteria } from "@/app/actions";
import { PatientSubmitted } from "@/components/PatientSubmitted";

export function CriteriaForm({
  questionnaireKey,
  targetUserId,
}: {
  questionnaireKey: string;
  targetUserId?: string;
}) {
  const router = useRouter();
  const def = CRITERIA_DEFS[questionnaireKey];
  const [answers, setAnswers] = useState<CriteriaAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = isCriteriaComplete(def, answers);
  const result = useMemo(() => computeCriteria(def, answers), [def, answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveCriteria(targetUserId, questionnaireKey, answers)
      : await saveCriteria(questionnaireKey, answers);
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Não foi possível salvar.");
  }

  if (saved) {
    if (!targetUserId)
      return (
        <PatientSubmitted
          onBack={() => {
            router.push("/inicio");
            router.refresh();
          }}
        />
      );
    return (
      <div className="space-y-5">
        <div className="card flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h2 className="font-display text-xl font-semibold text-navy-800">
            Registrado!
          </h2>
          <p className="text-sm text-navy-500">
            {result.met ? def.metLabel : def.notMetLabel} ({result.count}/
            {def.items.length})
          </p>
        </div>
        <button
          onClick={() => {
            router.push(targetUserId ? `/admin/${targetUserId}` : "/inicio");
            router.refresh();
          }}
          className="btn-primary w-full"
        >
          {targetUserId ? "Voltar à ficha do paciente" : "Voltar ao início"}
        </button>
      </div>
    );
  }

  const YesNo = ({ it }: { it: CritItem }) => {
    const v = answers[it.id];
    return (
      <div className="flex items-center justify-between gap-3 border-t border-navy-100 py-2.5 first:border-0 first:pt-0">
        <span className="text-sm text-navy-800">{it.label}</span>
        <div className="flex shrink-0 gap-1.5">
          {[
            { b: true, label: "Sim" },
            { b: false, label: "Não" },
          ].map((o) => {
            const active = v === o.b;
            return (
              <button
                key={o.label}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [it.id]: o.b }))}
                aria-pressed={active}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? o.b
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-navy-400 bg-navy-100 text-navy-700"
                    : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {def.intro && (
        <div className="card bg-navy-50 text-sm text-navy-600">{def.intro}</div>
      )}

      <section className="card">
        <h2 className="font-display text-lg font-semibold text-navy-800">
          Pré-requisitos
        </h2>
        <div className="mt-2">
          {def.gate.map((it) => (
            <YesNo key={it.id} it={it} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="font-display text-lg font-semibold text-navy-800">
          Critérios
        </h2>
        <div className="mt-2">
          {def.items.map((it) => (
            <YesNo key={it.id} it={it} />
          ))}
        </div>
        {def.note && (
          <p className="mt-3 text-xs text-navy-400">{def.note}</p>
        )}
      </section>

      {complete && targetUserId && (
        <div
          className={`card text-sm font-medium ${
            result.met
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "bg-navy-50 text-navy-600"
          }`}
        >
          {result.met ? def.metLabel : def.notMetLabel} · {result.count}/
          {def.items.length} itens
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!complete || saving}
        className="btn-primary w-full"
      >
        {saving
          ? "Salvando..."
          : complete
          ? "Salvar"
          : "Responda todos os itens"}
      </button>
    </div>
  );
}
