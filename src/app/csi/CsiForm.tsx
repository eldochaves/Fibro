"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LikertRow } from "@/components/LikertRow";
import {
  CSI_ITEMS,
  CSI_OPTIONS,
  computeCsi,
  isCsiComplete,
  type CsiAnswers,
} from "@/lib/csi";
import { saveCsi } from "@/app/actions";

export function CsiForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<CsiAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const complete = isCsiComplete(answers);
  const result = useMemo(() => computeCsi(answers), [answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await saveCsi(answers);
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
          <div className="rounded-xl bg-navy-50 px-3 py-2">
            <div className="text-xs text-navy-400">Escore CSI</div>
            <div className="text-lg font-bold text-navy-900">
              {result.total}/100 · {result.category.label}
            </div>
          </div>
          <p className="text-xs text-navy-300">
            Referência: subclínico 0–29 · leve 30–39 · moderado 40–49 · grave
            50–59 · extremo 60–100. Ferramenta de apoio, não é diagnóstico.
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
          Marque a frequência com que cada situação acontece com você.
        </p>
        <div className="mt-4 space-y-3">
          {CSI_ITEMS.map((it) => (
            <LikertRow
              key={it.id}
              label={it.label}
              options={CSI_OPTIONS}
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
            Respondidas: <strong>{answered}</strong> de {CSI_ITEMS.length}
          </span>
          {complete && (
            <span className="font-semibold text-teal-700">
              Escore: {result.total}/100
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
