"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeScored,
  isScoredComplete,
  scoredQuestions,
  type ScoredAnswers,
} from "@/lib/scored";
import { SCORED_DEFS } from "@/lib/lequesne";
import { saveScored, adminSaveScored } from "@/app/actions";

export function ScoredChoiceForm({
  questionnaireKey,
  targetUserId,
}: {
  questionnaireKey: string;
  targetUserId?: string;
}) {
  const router = useRouter();
  const def = SCORED_DEFS[questionnaireKey];
  const [answers, setAnswers] = useState<ScoredAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = scoredQuestions(def).length;
  const answered = Object.keys(answers).length;
  const complete = isScoredComplete(def, answers);
  const result = useMemo(() => computeScored(def, answers), [def, answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveScored(targetUserId, questionnaireKey, answers)
      : await saveScored(questionnaireKey, answers);
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Não foi possível salvar.");
  }

  if (saved) {
    return (
      <div className="space-y-5">
        <div className="card flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h2 className="font-display text-xl font-semibold text-navy-800">
            Questionário enviado!
          </h2>
          <p className="text-sm text-navy-500">
            Escore: <strong>{result.total}</strong>/{def.maxScore}
            {result.category ? ` · ${result.category}` : ""}
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

  return (
    <div className="space-y-6">
      {def.sections.map((sec, si) => (
        <section key={si} className="card">
          {sec.title && (
            <h2 className="font-display text-lg font-semibold text-navy-800">
              {sec.title}
            </h2>
          )}
          {sec.subtitle && (
            <p className="mt-1 text-sm text-navy-500">{sec.subtitle}</p>
          )}
          <div className="mt-4 space-y-5">
            {sec.questions.map((q) => (
              <div key={q.id}>
                {q.label && (
                  <div className="mb-2 text-sm font-medium text-navy-800">
                    {q.label}
                  </div>
                )}
                <div className="space-y-1.5">
                  {q.options.map((opt, idx) => {
                    const active = answers[q.id] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [q.id]: idx }))
                        }
                        aria-pressed={active}
                        className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                          active
                            ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                            : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            active
                              ? "border-teal-600 bg-teal-600"
                              : "border-navy-300"
                          }`}
                        >
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-navy-100 bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="mb-2 flex items-center justify-between text-xs text-navy-400">
          <span>
            Respondidas: <strong>{answered}</strong> de {total}
          </span>
          {complete && (
            <span className="font-semibold text-teal-700">
              Escore: {result.total}/{def.maxScore}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!complete || saving}
          className="btn-primary w-full"
        >
          {saving
            ? "Enviando..."
            : complete
            ? "Enviar respostas"
            : "Responda todos os itens para enviar"}
        </button>
      </div>
    </div>
  );
}
