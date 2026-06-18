"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  computeLikert,
  isLikertComplete,
  likertItems,
  likertOptionsFor,
  type LikertAnswers,
} from "@/lib/likert";
import { LIKERT_DEFS } from "@/lib/koos";
import { saveLikert, adminSaveLikert } from "@/app/actions";

export function LikertScaleForm({
  questionnaireKey,
  targetUserId,
}: {
  questionnaireKey: string;
  targetUserId?: string;
}) {
  const router = useRouter();
  const def = LIKERT_DEFS[questionnaireKey];
  const [answers, setAnswers] = useState<LikertAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = likertItems(def).length;
  const answered = Object.keys(answers).length;
  const complete = isLikertComplete(def, answers);
  const result = useMemo(() => computeLikert(def, answers), [def, answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveLikert(targetUserId, questionnaireKey, answers)
      : await saveLikert(questionnaireKey, answers);
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
            Escore global: <strong>{result.score}</strong>/100 (maior = melhor)
          </p>
          <ul className="text-xs text-navy-400">
            {result.subscales.map((s) => (
              <li key={s.key}>
                {s.title}: {s.score}/100
              </li>
            ))}
          </ul>
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
      {def.intro && (
        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {def.intro}
        </p>
      )}

      {def.subscales.map((sec) => (
        <section key={sec.key} className="card">
          <h2 className="font-display text-lg font-semibold text-navy-800">
            {sec.title}
          </h2>
          {sec.subtitle && (
            <p className="mt-1 text-sm text-navy-500">{sec.subtitle}</p>
          )}
          <div className="mt-4 space-y-5">
            {sec.items.map((q) => {
              const opts = likertOptionsFor(def, sec, q);
              return (
                <div key={q.id}>
                  <div className="mb-2 text-sm font-medium text-navy-800">
                    {q.label}
                  </div>
                  <div className="space-y-1.5">
                    {opts.map((label, idx) => {
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
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
              Escore global: {result.score}/100
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
