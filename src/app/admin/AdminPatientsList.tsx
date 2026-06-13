"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface PatientSummary {
  id: string;
  fullName: string | null;
  email: string | null;
  count: number;
  latestDate: string | null;
  latestMeets: boolean | null;
  latestScore: number | null;
}

export function AdminPatientsList({ patients }: { patients: PatientSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        (p.fullName ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q)
    );
  }, [patients, query]);

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          className="input"
          placeholder="Buscar por nome ou email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar paciente"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center text-slate-600">
          {patients.length === 0
            ? "Nenhum paciente cadastrou avaliações ainda."
            : "Nenhum paciente encontrado para esta busca."}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/admin/${p.id}`}
                className="card flex items-center justify-between hover:border-brand-300"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">
                    {p.fullName || "(sem nome)"}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {p.email}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {p.count} avaliação(ões)
                    {p.latestDate && ` · última em ${formatDate(p.latestDate)}`}
                  </div>
                </div>
                {p.latestScore !== null && (
                  <span
                    className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      p.latestMeets
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    FS {p.latestScore}
                  </span>
                )}
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
