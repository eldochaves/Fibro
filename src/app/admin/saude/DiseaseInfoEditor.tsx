"use client";

import { useState } from "react";
import { adminSaveDiseaseInfo } from "@/app/actions";
import type { DiseaseResource } from "@/lib/diseaseInfo";

export interface DiseaseInfoItem {
  key: string;
  label: string;
  icon: string;
  summary: string;
  resources: DiseaseResource[];
}

export function DiseaseInfoEditor({ items }: { items: DiseaseInfoItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <DiseaseRow key={it.key} item={it} />
      ))}
    </div>
  );
}

function DiseaseRow({ item }: { item: DiseaseInfoItem }) {
  const [summary, setSummary] = useState(item.summary);
  const [resources, setResources] = useState<DiseaseResource[]>(item.resources);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, field: keyof DiseaseResource, value: string) {
    setSaved(false);
    setResources((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );
  }
  function addResource() {
    setSaved(false);
    setResources((prev) => [...prev, { title: "", source: "", url: "" }]);
  }
  function removeResource(i: number) {
    setSaved(false);
    setResources((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await adminSaveDiseaseInfo(item.key, { summary, resources });
    setSaving(false);
    if (res.ok) setSaved(true);
    else setError(res.error ?? "Não foi possível salvar.");
  }

  return (
    <details className="card">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy-800">
        <span className="text-lg">{item.icon}</span>
        {item.label}
        {saved && <span className="text-xs font-normal text-teal-700">✓ salvo</span>}
      </summary>

      <div className="mt-4 space-y-4">
        <div>
          <label className="label">Resumo (linguagem simples para o paciente)</label>
          <textarea
            className="input min-h-[120px]"
            value={summary}
            onChange={(e) => {
              setSaved(false);
              setSummary(e.target.value);
            }}
            placeholder="Escreva um resumo curto e acolhedor sobre a doença…"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label mb-0">Links (materiais oficiais)</span>
            <button
              type="button"
              onClick={addResource}
              className="text-xs font-medium text-teal-700 hover:underline"
            >
              + Adicionar link
            </button>
          </div>

          {resources.length === 0 ? (
            <p className="text-xs text-navy-400">
              Nenhum link específico. Use “Adicionar link” para incluir uma
              cartilha ou página oficial (ex.: SBR).
            </p>
          ) : (
            <div className="space-y-3">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-navy-100 p-3"
                >
                  <div className="grid gap-2">
                    <input
                      className="input"
                      value={r.title}
                      onChange={(e) => update(i, "title", e.target.value)}
                      placeholder="Título (ex.: Osteoartrite — material para pacientes)"
                    />
                    <input
                      className="input"
                      value={r.source}
                      onChange={(e) => update(i, "source", e.target.value)}
                      placeholder="Fonte (ex.: Sociedade Brasileira de Reumatologia)"
                    />
                    <input
                      className="input"
                      value={r.url}
                      onChange={(e) => update(i, "url", e.target.value)}
                      placeholder="https://…"
                      inputMode="url"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeResource(i)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
          {saved && <span className="text-sm text-teal-700">✓ Salvo</span>}
        </div>
      </div>
    </details>
  );
}
