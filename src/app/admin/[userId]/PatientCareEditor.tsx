"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSetPatientCare } from "@/app/actions";
import { DISEASES, QUESTIONNAIRES } from "@/lib/questionnaires";

export function PatientCareEditor({
  userId,
  initialDiseases,
  initialQuestionnaires,
}: {
  userId: string;
  initialDiseases: string[];
  initialQuestionnaires: string[];
}) {
  const router = useRouter();
  const [diseases, setDiseases] = useState<string[]>(initialDiseases);
  const [questionnaires, setQuestionnaires] = useState<string[]>(
    initialQuestionnaires
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, key: string) {
    setSaved(false);
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await adminSetPatientCare(userId, { diseases, questionnaires });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível salvar.");
    }
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
                onClick={() => toggle(diseases, setDiseases, d.key)}
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

      {/* Questionários */}
      <div className="mt-5">
        <span className="label">Questionários liberados</span>
        <div className="space-y-2">
          {QUESTIONNAIRES.map((q) => {
            const active = questionnaires.includes(q.key);
            return (
              <button
                key={q.key}
                type="button"
                onClick={() => toggle(questionnaires, setQuestionnaires, q.key)}
                aria-pressed={active}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active
                    ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500"
                    : "border-navy-200 bg-white hover:border-navy-300"
                }`}
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
                  <span className="block text-xs text-navy-400">
                    {q.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

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
