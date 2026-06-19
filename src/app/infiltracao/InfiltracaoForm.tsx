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
  type SiteAnswer,
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
  const [a, setA] = useState<InfiltracaoAnswers>({
    perSite: initialSites.map((site) => ({ site })),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const perSite = a.perSite ?? [];
  const selected = (key: string) => perSite.some((s) => s.site === key);
  const complete = isInfiltracaoComplete(a);

  function toggleSite(site: string) {
    setA((prev) => {
      const list = prev.perSite ?? [];
      return {
        ...prev,
        perSite: list.some((s) => s.site === site)
          ? list.filter((s) => s.site !== site)
          : [...list, { site }],
      };
    });
  }
  function updateSite(site: string, patch: Partial<SiteAnswer>) {
    setA((prev) => ({
      ...prev,
      perSite: (prev.perSite ?? []).map((s) =>
        s.site === site ? { ...s, ...patch } : s
      ),
    }));
  }
  const setGlobal = (patch: Partial<InfiltracaoAnswers>) =>
    setA((prev) => ({ ...prev, ...patch }));

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

  // Renderiza os locais na ordem padrão
  const orderedSites = TENDINITE_SUBTYPES.filter((s) => selected(s.key));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
        Este é um retorno sobre a sua <strong>infiltração</strong> (com lidocaína
        e betametasona). Se você fez em mais de um lugar, vamos perguntar sobre
        <strong> cada local separadamente</strong>. 💙
      </div>

      {/* Seleção de locais (pré-marcada pelo médico) */}
      <section className="card">
        <h2 className="font-display text-base font-semibold text-navy-800">
          Onde você fez a infiltração?
        </h2>
        <p className="mt-1 text-xs text-navy-400">
          Já deixamos marcado o que o seu médico indicou. Ajuste se precisar.
        </p>
        <div className="mt-3 space-y-2">
          {TENDINITE_SUBTYPES.map((s) => {
            const active = selected(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSite(s.key)}
                aria-pressed={active}
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  active
                    ? "border-purple-500 bg-purple-50 ring-1 ring-purple-400"
                    : "border-navy-200 bg-white hover:border-navy-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    active
                      ? "border-purple-600 bg-purple-600 text-white"
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
                    {s.label}
                  </span>
                  <span className="block text-xs text-navy-500">{s.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Um bloco de perguntas por local */}
      {orderedSites.map((meta, idx) => {
        const s = perSite.find((p) => p.site === meta.key)!;
        return (
          <section
            key={meta.key}
            className="rounded-2xl border border-purple-200 bg-purple-50/30 p-4"
          >
            <h2 className="font-display text-base font-semibold text-purple-900">
              {orderedSites.length > 1
                ? `Local ${idx + 1} de ${orderedSites.length}: `
                : ""}
              {meta.label}
            </h2>
            <p className="mb-3 mt-0.5 text-xs text-navy-500">{meta.desc}</p>

            <div className="space-y-4">
              <Choice
                title="Comparado a ANTES da infiltração, como está esse local?"
                options={PGIC_OPTIONS}
                value={s.pgic}
                onChange={(i) => updateSite(meta.key, { pgic: i })}
              />
              <Choice
                title="Quando você começou a sentir melhora nesse local?"
                options={INICIO_OPTIONS}
                value={s.inicio}
                onChange={(i) => updateSite(meta.key, { inicio: i })}
              />
              <Scale
                title="Como está a dor nesse local agora?"
                min="0 · sem dor"
                max="pior dor · 10"
                value={s.dor}
                onChange={(v) => updateSite(meta.key, { dor: v })}
              />
              <Scale
                title="Qual a sua satisfação com o resultado nesse local?"
                min="0 · nada satisfeito"
                max="muito satisfeito · 10"
                value={s.satisfacao}
                onChange={(v) => updateSite(meta.key, { satisfacao: v })}
              />
              <Scale
                title="Quanto desconforto sentiu DURANTE a aplicação nesse local?"
                min="0 · nenhum"
                max="muito · 10"
                value={s.conforto}
                onChange={(v) => updateSite(meta.key, { conforto: v })}
              />
              <YesNoDesc
                title="Teve algum efeito indesejado nesse local?"
                value={s.efeito}
                desc={s.efeito_desc}
                onChange={(b) =>
                  updateSite(meta.key, {
                    efeito: b,
                    ...(b ? {} : { efeito_desc: "" }),
                  })
                }
                onDesc={(t) => updateSite(meta.key, { efeito_desc: t })}
              />
            </div>
          </section>
        );
      })}

      {orderedSites.length === 0 && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Selecione ao menos um local acima para responder.
        </p>
      )}

      {/* Perguntas gerais (uma vez) */}
      {orderedSites.length > 0 && (
        <>
          <Choice
            title="De modo geral, você recomendaria esse procedimento a outra pessoa?"
            options={RECOMENDA_OPTIONS}
            value={a.recomenda}
            onChange={(i) => setGlobal({ recomenda: i })}
          />
          <section className="card">
            <h2 className="font-display text-base font-semibold text-navy-800">
              Conte com suas palavras como foi sua experiência
            </h2>
            <p className="mt-1 text-xs text-navy-400">Opcional.</p>
            <textarea
              className="input mt-3 min-h-[120px]"
              value={a.depoimento ?? ""}
              onChange={(e) => setGlobal({ depoimento: e.target.value })}
              placeholder="Ex.: como foi o procedimento, o atendimento, como você se sentiu depois…"
            />
            <div className="mt-3 space-y-2">
              <Check
                label="Autorizo que a minha opinião seja compartilhada, de forma anônima, com outros pacientes."
                checked={a.consent === true}
                onChange={(b) => setGlobal({ consent: b })}
              />
              {a.consent && (
                <Check
                  label="Também autorizo o uso do meu primeiro nome junto ao depoimento."
                  checked={a.consent_nome === true}
                  onChange={(b) => setGlobal({ consent_nome: b })}
                />
              )}
            </div>
          </section>
        </>
      )}

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
          : "Responda os itens de cada local para enviar"}
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
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <h3 className="mb-2 text-sm font-medium text-navy-800">{title}</h3>
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
    </div>
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
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <h3 className="mb-2 text-sm font-medium text-navy-800">{title}</h3>
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
    </div>
  );
}

function YesNoDesc({
  title,
  value,
  desc,
  onChange,
  onDesc,
}: {
  title: string;
  value: boolean | undefined;
  desc: string | undefined;
  onChange: (b: boolean) => void;
  onDesc: (t: string) => void;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <h3 className="mb-2 text-sm font-medium text-navy-800">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {[
          { b: true, label: "Sim" },
          { b: false, label: "Não" },
        ].map((o) => {
          const active = value === o.b;
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => onChange(o.b)}
              aria-pressed={active}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
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
      {value === true && (
        <textarea
          className="input mt-2 min-h-[70px]"
          value={desc ?? ""}
          onChange={(e) => onDesc(e.target.value)}
          placeholder="Descreva o efeito que você sentiu (ex.: dor, vermelhidão, inchaço…)"
        />
      )}
    </div>
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
