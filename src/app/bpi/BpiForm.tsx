"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BPI_SEVERITY,
  BPI_INTERFERENCE,
  BPI_ALL_ITEMS,
  computeBpi,
  isBpiComplete,
  type BpiAnswers,
  type BpiItem,
} from "@/lib/bpi";
import { saveBpi, adminSaveBpi } from "@/app/actions";
import { scaleColor } from "@/lib/scaleColor";
import { PatientSubmitted } from "@/components/PatientSubmitted";

export function BpiForm({ targetUserId }: { targetUserId?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<BpiAnswers>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.keys(answers).length;
  const complete = isBpiComplete(answers);
  const result = useMemo(() => computeBpi(answers), [answers]);

  function setItem(id: string, v: number) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveBpi(targetUserId, answers)
      : await saveBpi(answers);
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
              Gravidade {result.severity}/10 · Interferência{" "}
              {result.interference}/10
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
            Gravidade <strong>{result.severity}</strong>/10 · Interferência{" "}
            <strong>{result.interference}</strong>/10
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
      <Section
        title="Gravidade da dor"
        subtitle="Marque o número que melhor descreve a sua dor."
        items={BPI_SEVERITY}
        answers={answers}
        onChange={setItem}
      />
      <Section
        title="Interferência da dor"
        subtitle="Nas últimas 24 horas, o quanto a dor interferiu em cada item?"
        items={BPI_INTERFERENCE}
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
            {BPI_ALL_ITEMS.length}
          </span>
          {complete && targetUserId && (
            <span className="font-semibold text-teal-700">
              Gravidade {result.severity}/10 · Interferência{" "}
              {result.interference}/10
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
  items: BpiItem[];
  answers: BpiAnswers;
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
  item: BpiItem;
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
