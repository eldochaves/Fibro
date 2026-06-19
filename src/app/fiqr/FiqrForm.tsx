"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FIQR_FUNCTION,
  FIQR_OVERALL,
  FIQR_SYMPTOMS,
  FIQR_ALL_ITEMS,
  computeFiqr,
  isFiqrComplete,
  type FiqrAnswers,
  type FiqrItem,
} from "@/lib/fiqr";
import { saveFiqr, adminSaveFiqr } from "@/app/actions";
import { scaleColor } from "@/lib/scaleColor";
import { PatientSubmitted } from "@/components/PatientSubmitted";

export function FiqrForm({ targetUserId }: { targetUserId?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<FiqrAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const complete = isFiqrComplete(answers);
  const result = useMemo(() => computeFiqr(answers), [answers]);

  function setItem(id: string, v: number) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveFiqr(targetUserId, answers)
      : await saveFiqr(answers);
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Não foi possível salvar.");
  }

  if (saved) {
    if (!targetUserId)
      return (
        <PatientSubmitted
          score={
            <>
              Pontuação: {result.total}/100
            </>
          }
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
            Questionário enviado!
          </h2>
          <p className="text-sm text-navy-500">
            Suas respostas foram salvas e seu médico poderá acompanhar.
          </p>
        </div>
        <FiqrResultCard result={result} />
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
      <Section
        title="Função física"
        subtitle="Nos últimos 7 dias, qual a sua dificuldade para realizar cada tarefa? (Se normalmente não faz, estime.)"
        items={FIQR_FUNCTION}
        answers={answers}
        onChange={setItem}
      />
      <Section
        title="Impacto global"
        subtitle="O quanto cada afirmação foi verdadeira para você nos últimos 7 dias?"
        items={FIQR_OVERALL}
        answers={answers}
        onChange={setItem}
      />
      <Section
        title="Sintomas"
        subtitle="Marque a intensidade de cada sintoma nos últimos 7 dias."
        items={FIQR_SYMPTOMS}
        answers={answers}
        onChange={setItem}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-navy-100 bg-[var(--bg)]/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="mb-2 flex items-center justify-between text-xs text-navy-400">
          <span>
            Respondidas: <strong>{answeredCount}</strong> de{" "}
            {FIQR_ALL_ITEMS.length}
          </span>
          {complete && targetUserId && (
            <span className="font-semibold text-teal-700">
              Pontuação: {result.total}/100
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

function Section({
  title,
  subtitle,
  items,
  answers,
  onChange,
}: {
  title: string;
  subtitle: string;
  items: FiqrItem[];
  answers: FiqrAnswers;
  onChange: (id: string, v: number) => void;
}) {
  return (
    <section className="card">
      <h2 className="font-display text-lg font-semibold text-navy-800">
        {title}
      </h2>
      <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
      <div className="mt-4 space-y-5">
        {items.map((it) => (
          <ScaleRow
            key={it.id}
            item={it}
            value={answers[it.id]}
            onChange={(v) => onChange(it.id, v)}
          />
        ))}
      </div>
    </section>
  );
}

function ScaleRow({
  item,
  value,
  onChange,
}: {
  item: FiqrItem;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-navy-800">
        {item.label}
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, v) => {
          const active = value === v;
          const color = scaleColor(v, 10);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={active}
              aria-label={`${item.label}: ${v}`}
              className="rounded-md border py-2 text-xs font-bold transition"
              style={
                active
                  ? { backgroundColor: color, borderColor: color, color: "#fff" }
                  : { borderColor: "#dbe6ee", color }
              }
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-navy-300">
        <span>0 · {item.minLabel}</span>
        <span>{item.maxLabel} · 10</span>
      </div>
    </div>
  );
}

export function FiqrResultCard({
  result,
}: {
  result: ReturnType<typeof computeFiqr>;
}) {
  const toneClass =
    result.category.tone === "good"
      ? "bg-green-50 text-green-700"
      : result.category.tone === "mild"
      ? "bg-teal-50 text-teal-700"
      : result.category.tone === "moderate"
      ? "bg-amber-50 text-amber-800"
      : "bg-red-50 text-red-700";

  return (
    <div className="card space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Função" value={`${result.functionScore}/30`} />
        <Metric label="Impacto global" value={`${result.overallScore}/20`} />
        <Metric label="Sintomas" value={`${result.symptomsScore}/50`} />
        <Metric label="Total" value={`${result.total}/100`} />
      </div>
      <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toneClass}`}>
        {result.category.label} · escore total {result.total}/100
      </div>
      <p className="text-xs text-navy-300">
        Faixas de referência: remissão 0–23 · leve 24–40 · moderado 41–63 ·
        grave 64–100. Ferramenta de apoio; não substitui a avaliação médica.
      </p>
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
