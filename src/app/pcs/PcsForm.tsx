"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LikertRow } from "@/components/LikertRow";
import {
  PCS_ITEMS,
  PCS_OPTIONS,
  computePcs,
  isPcsComplete,
  type PcsAnswers,
} from "@/lib/pcs";
import { savePcs } from "@/app/actions";

export function PcsForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<PcsAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const complete = isPcsComplete(answers);
  const result = useMemo(() => computePcs(answers), [answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await savePcs(answers);
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
            Suas respostas foram salvas e seu médico poderá acompanhar.
          </p>
        </div>
        <div className="card space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Ruminação" value={`${result.rumination}/16`} />
            <Metric label="Magnificação" value={`${result.magnification}/12`} />
            <Metric label="Desamparo" value={`${result.helplessness}/24`} />
            <Metric label="Total" value={`${result.total}/52`} />
          </div>
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              result.category.tone === "good"
                ? "bg-green-50 text-green-700"
                : result.category.tone === "moderate"
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {result.category.label}
          </div>
          <p className="text-xs text-navy-300">
            Corte clínico: total ≥ 30 sugere catastrofização relevante.
            Ferramenta de apoio, não é diagnóstico.
          </p>
        </div>
        <button
          onClick={() => {
            router.push("/inicio");
            router.refresh();
          }}
          className="btn-primary w-full"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card">
        <p className="text-sm text-navy-500">
          Quando você sente dor, com que frequência tem cada pensamento ou
          sentimento abaixo?
        </p>
        <div className="mt-4 space-y-3">
          {PCS_ITEMS.map((it) => (
            <LikertRow
              key={it.id}
              label={it.label}
              options={PCS_OPTIONS}
              value={answers[it.id]}
              onChange={(v) => setAnswers((a) => ({ ...a, [it.id]: v }))}
            />
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-navy-100 bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="mb-2 flex items-center justify-between text-xs text-navy-400">
          <span>
            Respondidas: <strong>{answered}</strong> de {PCS_ITEMS.length}
          </span>
          {complete && (
            <span className="font-semibold text-teal-700">
              Total: {result.total}/52
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-50 px-3 py-2">
      <div className="text-xs text-navy-400">{label}</div>
      <div className="text-lg font-bold text-navy-900">{value}</div>
    </div>
  );
}
