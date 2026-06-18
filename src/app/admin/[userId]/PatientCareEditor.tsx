"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminSetPatientCare } from "@/app/actions";
import {
  DISEASES,
  QUESTIONNAIRES,
  QUESTIONNAIRE_BY_KEY,
  CRITERION_TYPE_LABEL,
  type QuestionnaireDef,
} from "@/lib/questionnaires";
import {
  FREQUENCY_OPTIONS,
  normalizeFrequency,
  type Frequency,
} from "@/lib/availability";

export function PatientCareEditor({
  userId,
  initialDiseases,
  initialQuestionnaires,
  initialFreq,
}: {
  userId: string;
  initialDiseases: string[];
  initialQuestionnaires: string[];
  initialFreq: Record<string, string>;
}) {
  const router = useRouter();
  const [diseases, setDiseases] = useState<string[]>(initialDiseases);
  const [questionnaires, setQuestionnaires] = useState<string[]>(
    initialQuestionnaires
  );
  const [freq, setFreq] = useState<Record<string, Frequency>>(() => {
    const o: Record<string, Frequency> = {};
    for (const q of QUESTIONNAIRES)
      o[q.key] = normalizeFrequency(initialFreq?.[q.key]);
    return o;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, key: string) {
    setSaved(false);
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  }

  // Ao desmarcar uma doença, desmarca os questionários ligados só a ela
  function toggleDisease(key: string) {
    setSaved(false);
    setDiseases((prev) => {
      const removing = prev.includes(key);
      const next = removing
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      if (removing) {
        setQuestionnaires((qs) =>
          qs.filter((qk) => {
            const def = QUESTIONNAIRE_BY_KEY[qk];
            if (!def || def.diseases.length === 0) return true;
            return def.diseases.some((d) => next.includes(d));
          })
        );
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await adminSetPatientCare(userId, {
      diseases,
      questionnaires,
      questionnaire_freq: freq,
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível salvar.");
    }
  }

  // Só mostra questionários da(s) doença(s) marcada(s); genéricos (EVA) sempre.
  const visible = QUESTIONNAIRES.filter(
    (q) => q.diseases.length === 0 || q.diseases.some((d) => diseases.includes(d))
  );
  const avaliacoes = visible.filter((q) => q.kind !== "criterio");
  const criterios = visible.filter((q) => q.kind === "criterio");

  function renderItem(q: QuestionnaireDef) {
    const active = questionnaires.includes(q.key);
    return (
      <div
        key={q.key}
        className={`rounded-xl border transition ${
          active
            ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
            : "border-navy-200 bg-white"
        }`}
      >
        <button
          type="button"
          onClick={() => toggle(questionnaires, setQuestionnaires, q.key)}
          aria-pressed={active}
          className="flex w-full items-start gap-3 px-4 py-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              active
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-navy-300"
            }`}
          >
            {active && (
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
          <span>
            <span className="block text-sm font-semibold text-navy-800">
              {q.name}
            </span>
            <span className="block text-xs text-navy-400">{q.description}</span>
            {q.kind === "criterio" && q.criterionType && (
              <span className="mt-1 inline-block rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">
                {CRITERION_TYPE_LABEL[q.criterionType]}
              </span>
            )}
          </span>
        </button>

        {active && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-teal-200 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`freq-${q.key}`}
                className="text-xs font-medium text-navy-600"
              >
                Disponibilidade:
              </label>
              <select
                id={`freq-${q.key}`}
                value={freq[q.key]}
                onChange={(e) => {
                  setSaved(false);
                  setFreq((f) => ({
                    ...f,
                    [q.key]: e.target.value as Frequency,
                  }));
                }}
                className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 outline-none focus:border-teal-400"
              >
                {FREQUENCY_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href={`/admin/${userId}/responder/${q.key}`}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              ✍️ Responder pelo paciente
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card print:hidden">
      <h2 className="font-display text-lg font-semibold text-navy-800">
        Doenças e questionários
      </h2>
      <p className="mt-1 text-sm text-navy-500">
        Marque as doenças do paciente e libere os questionários que ele poderá
        responder.
      </p>

      {/* Doenças */}
      <div className="mt-4">
        <span className="label">Doenças</span>
        <div className="flex flex-wrap gap-2">
          {DISEASES.map((d) => {
            const active = diseases.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDisease(d.key)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                    : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ferramentas de avaliação */}
      <div className="mt-5">
        <span className="label">Ferramentas de avaliação</span>
        {avaliacoes.length === 0 ? (
          <p className="text-sm text-navy-400">
            Marque uma doença acima para ver os questionários disponíveis.
          </p>
        ) : (
          <div className="space-y-2">{avaliacoes.map(renderItem)}</div>
        )}
      </div>

      {/* Critérios diagnósticos / classificatórios */}
      {criterios.length > 0 && (
        <div className="mt-5">
          <span className="label">Critérios diagnósticos / classificatórios</span>
          <div className="space-y-2">{criterios.map(renderItem)}</div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button onClick={handleSave} className="btn-primary" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </button>
        {saved && <span className="text-sm text-teal-700">✓ Salvo</span>}
      </div>
    </div>
  );
}
