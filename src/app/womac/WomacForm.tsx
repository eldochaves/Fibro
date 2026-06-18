"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LikertRow } from "@/components/LikertRow";
import {
  WOMAC_SECTIONS,
  WOMAC_ITEMS,
  WOMAC_OPTIONS,
  computeWomac,
  isWomacComplete,
  type WomacAnswers,
} from "@/lib/womac";
import { saveWomac, adminSaveWomac } from "@/app/actions";

export function WomacForm({ targetUserId }: { targetUserId?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<WomacAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = Object.keys(answers).length;
  const complete = isWomacComplete(answers);
  const result = useMemo(() => computeWomac(answers), [answers]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveWomac(targetUserId, answers)
      : await saveWomac(answers);
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
        <div className="card">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Dor" value={`${result.pain}/20`} />
            <Metric label="Rigidez" value={`${result.stiffness}/8`} />
            <Metric label="Função" value={`${result.function}/68`} />
            <Metric label="Total" value={`${result.total}/96`} />
          </div>
          <p className="mt-3 text-xs text-navy-300">
            Quanto maior o escore, maior o comprometimento. Ferramenta de apoio,
            não é diagnóstico.
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
      {WOMAC_SECTIONS.map((sec) => (
        <section key={sec.id} className="card">
          <h2 className="font-display text-lg font-semibold text-navy-800">
            {sec.title}
          </h2>
          <p className="mt-1 text-sm text-navy-500">{sec.subtitle}</p>
          <div className="mt-4 space-y-3">
            {sec.items.map((it) => (
              <LikertRow
                key={it.id}
                label={it.label}
                options={WOMAC_OPTIONS}
                value={answers[it.id]}
                onChange={(v) => setAnswers((a) => ({ ...a, [it.id]: v }))}
              />
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
            Respondidas: <strong>{answered}</strong> de {WOMAC_ITEMS.length}
          </span>
          {complete && (
            <span className="font-semibold text-teal-700">
              Total: {result.total}/96
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
