"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { DISEASE_LABEL } from "@/lib/questionnaires";

export interface PatientIndex {
  label: string;
  value: number;
  suffix?: string;
  highlight?: boolean;
}

export interface PatientSummary {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  diseases: string[];
  indices: PatientIndex[];
  pending: boolean;
  latestDate: string | null;
}

export function AdminPatientsList({ patients }: { patients: PatientSummary[] }) {
  const [query, setQuery] = useState("");
  const [disease, setDisease] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [sort, setSort] = useState<"atividade" | "nome">("atividade");

  const diseaseOptions = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => p.diseases.forEach((d) => set.add(d)));
    return Array.from(set);
  }, [patients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = patients.filter((p) => {
      if (q) {
        const hit =
          (p.fullName ?? "").toLowerCase().includes(q) ||
          (p.email ?? "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (disease && !p.diseases.includes(disease)) return false;
      if (onlyPending && !p.pending) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      if (sort === "nome")
        return (a.fullName ?? "").localeCompare(b.fullName ?? "");
      const ta = a.latestDate ? Date.parse(a.latestDate) : 0;
      const tb = b.latestDate ? Date.parse(b.latestDate) : 0;
      return tb - ta;
    });
    return arr;
  }, [patients, query, disease, onlyPending, sort]);

  return (
    <>
      <div className="mb-4 space-y-2">
        <input
          type="search"
          className="input"
          placeholder="Buscar por nome ou email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar paciente"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-sm text-navy-700 outline-none focus:border-teal-400"
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            aria-label="Filtrar por doença"
          >
            <option value="">Todas as doenças</option>
            {diseaseOptions.map((d) => (
              <option key={d} value={d}>
                {DISEASE_LABEL[d] ?? d}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-sm text-navy-700 outline-none focus:border-teal-400"
            value={sort}
            onChange={(e) => setSort(e.target.value as "atividade" | "nome")}
            aria-label="Ordenar"
          >
            <option value="atividade">Mais recentes</option>
            <option value="nome">Nome (A–Z)</option>
          </select>
          <button
            type="button"
            onClick={() => setOnlyPending((v) => !v)}
            aria-pressed={onlyPending}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              onlyPending
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
            }`}
          >
            🔔 Só pendências
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-navy-500">
          {patients.length === 0
            ? "Nenhum paciente cadastrou avaliações ainda."
            : "Nenhum paciente encontrado para esta busca."}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/${p.id}`}
                className="card flex h-full items-center gap-3 transition hover:border-teal-300 hover:shadow-card"
              >
                <Avatar url={p.avatarUrl} name={p.fullName} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-navy-800">
                      {p.fullName || "(sem nome)"}
                    </span>
                    {p.pending && (
                      <span
                        className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                        title="Questionário programado pendente"
                      >
                        🔔 pendência
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-navy-400">
                    {p.email}
                  </div>
                  {p.latestDate && (
                    <div className="mt-1 text-xs text-navy-300">
                      Última atividade em {formatDate(p.latestDate)}
                    </div>
                  )}
                  {p.diseases.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {p.diseases.map((d) => (
                        <span
                          key={d}
                          className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700"
                        >
                          {DISEASE_LABEL[d] ?? d}
                        </span>
                      ))}
                    </div>
                  )}
                  {p.indices.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.indices.map((idx) => (
                        <span
                          key={idx.label}
                          className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                            idx.highlight
                              ? "bg-amber-100 text-amber-800"
                              : "bg-navy-100 text-navy-600"
                          }`}
                          title={idx.label}
                        >
                          {idx.label} {idx.value}
                          {idx.suffix ?? ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
