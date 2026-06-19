"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scaleColor } from "@/lib/scaleColor";
import { PatientSubmitted } from "@/components/PatientSubmitted";
import {
  PGIC_OPTIONS,
  INICIO_OPTIONS,
  RECOMENDA_OPTIONS,
  isInfiltracaoComplete,
  type InfiltracaoAnswers,
} from "@/lib/infiltracao";
import { TENDINITE_SUBTYPES } from "@/lib/questionnaires";
import { saveInfiltracao, adminSaveInfiltracao } from "@/app/actions";

export function InfiltracaoForm({
  targetUserId,
  initialSites = [],
}: {
  targetUserId?: string;
  initialSites?: string[];
}) {
  const router = useRouter();
  const [a, setA] = useState<InfiltracaoAnswers>({ sites: initialSites });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<InfiltracaoAnswers>) =>
    setA((prev) => ({ ...prev, ...patch }));
  const complete = isInfiltracaoComplete(a);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = targetUserId
      ? await adminSaveInfiltracao(targetUserId, a)
      : await saveInfiltracao(a);
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
        <div className="card text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h2 className="font-display text-xl font-semibold text-navy-800">
            Feedback registrado!
          </h2>
        </div>
        <button
          onClick={() => {
            router.push(`/admin/${targetUserId}`);
            router.refresh();
          }}
          className="btn-primary w-full"
        >
          Voltar à ficha do paciente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
        Este é um retorno sobre a <strong>infiltração</strong> (com lidocaína e
        betametasona) que você realizou. Suas respostas ajudam o Dr. Eldo a
        cuidar de você e de outros pacientes. 💙
      </div>

      {/* Locais infiltrados (pré-marcados pelo médico; o paciente pode ajustar) */}
      <section className="card">
        <h2 className="font-display text-base font-semibold text-navy-800">
          Quais locais foram infiltrados?
        </h2>
        <p className="mt-1 text-xs text-navy-400">
          Já deixamos marcado o que o seu médico indicou. Ajuste se precisar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TENDINITE_SUBTYPES.map((s) => {
            const active = (a.sites ?? []).includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() =>
                  set({
                    sites: active
                      ? (a.sites ?? []).filter((k) => k !== s.key)
                      : [...(a.sites ?? []), s.key],
                  })
                }
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "border-purple-500 bg-purple-100 text-purple-800 ring-1 ring-purple-400"
                    : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* PGIC */}
      <Choice
        title="Comparado a ANTES da infiltração, como você se sente?"
        options={PGIC_OPTIONS}
        value={a.pgic}
        onChange={(i) => set({ pgic: i })}
      />

      {/* Tempo até melhorar */}
      <Choice
        title="Quando você começou a sentir melhora?"
        options={INICIO_OPTIONS}
        value={a.inicio}
        onChange={(i) => set({ inicio: i })}
      />

      {/* Dor agora */}
      <Scale
        title="Como está a sua dor agora?"
        min="0 · sem dor"
        max="pior dor · 10"
        value={a.dor}
        onChange={(v) => set({ dor: v })}
      />

      {/* Satisfação */}
      <Scale
        title="Qual o seu grau de satisfação com o procedimento?"
        min="0 · nada satisfeito"
        max="muito satisfeito · 10"
        value={a.satisfacao}
        onChange={(v) => set({ satisfacao: v })}
      />

      {/* Conforto durante a aplicação */}
      <Scale
        title="Quanta dor/desconforto você sentiu DURANTE a aplicação?"
        min="0 · nenhum"
        max="muito · 10"
        value={a.conforto}
        onChange={(v) => set({ conforto: v })}
      />

      {/* Efeito indesejado (+ descrição se sim) */}
      <section className="card">
        <h2 className="mb-3 font-display text-base font-semibold text-navy-800">
          Você teve algum efeito indesejado após a infiltração?
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { b: true, label: "Sim" },
            { b: false, label: "Não" },
          ].map((o) => {
            const active = a.efeito === o.b;
            return (
              <button
                key={o.label}
                type="button"
                onClick={() =>
                  set(o.b ? { efeito: true } : { efeito: false, efeito_desc: "" })
                }
                aria-pressed={active}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                    : "border-navy-200 bg-white text-navy-700"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        {a.efeito === true && (
          <div className="mt-3">
            <label className="label">Descreva o efeito que você sentiu</label>
            <textarea
              className="input min-h-[80px]"
              value={a.efeito_desc ?? ""}
              onChange={(e) => set({ efeito_desc: e.target.value })}
              placeholder="Ex.: dor no local, vermelhidão, inchaço, alteração na pele…"
            />
          </div>
        )}
      </section>

      {/* Recomendaria */}
      <Choice
        title="Você recomendaria esse procedimento a outra pessoa?"
        options={RECOMENDA_OPTIONS}
        value={a.recomenda}
        onChange={(i) => set({ recomenda: i })}
      />

      {/* Depoimento */}
      <section className="card">
        <h2 className="font-display text-base font-semibold text-navy-800">
          Conte com suas palavras como foi sua experiência
        </h2>
        <p className="mt-1 text-xs text-navy-400">Opcional.</p>
        <textarea
          className="input mt-3 min-h-[120px]"
          value={a.depoimento ?? ""}
          onChange={(e) => set({ depoimento: e.target.value })}
          placeholder="Ex.: como foi o procedimento, o atendimento, como você se sentiu depois…"
        />
        <div className="mt-3 space-y-2">
          <Check
            label="Autorizo que a minha opinião seja compartilhada, de forma anônima, com outros pacientes."
            checked={a.consent === true}
            onChange={(b) => set({ consent: b })}
          />
          {a.consent && (
            <Check
              label="Também autorizo o uso do meu primeiro nome junto ao depoimento."
              checked={a.consent_nome === true}
              onChange={(b) => set({ consent_nome: b })}
            />
          )}
        </div>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!complete || saving}
        className="btn-primary w-full text-base"
      >
        {saving
          ? "Enviando..."
          : complete
          ? "Enviar feedback"
          : "Responda os itens com escala/opção para enviar"}
      </button>
    </div>
  );
}

function Choice({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: number | undefined;
  onChange: (i: number) => void;
}) {
  return (
    <section className="card">
      <h2 className="mb-3 font-display text-base font-semibold text-navy-800">
        {title}
      </h2>
      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const active = value === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              aria-pressed={active}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500"
                  : "border-navy-200 bg-white text-navy-700 hover:border-navy-300"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  active ? "border-teal-600 bg-teal-600" : "border-navy-300"
                }`}
              >
                {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Scale({
  title,
  min,
  max,
  value,
  onChange,
}: {
  title: string;
  min: string;
  max: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <section className="card">
      <h2 className="mb-3 font-display text-base font-semibold text-navy-800">
        {title}
      </h2>
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
              aria-label={`${title}: ${v}`}
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
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </section>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex w-full items-start gap-2 text-left text-sm text-navy-700"
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          checked ? "border-teal-600 bg-teal-600 text-white" : "border-navy-300"
        }`}
      >
        {checked && (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
