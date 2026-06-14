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
                className="card flex h-full items-center justify-between transition hover:border-teal-300 hover:shadow-card"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-navy-800">
                    {p.fullName || "(sem nome)"}
                  </div>
                  <div className="truncate text-xs text-navy-400">
                    {p.email}
                  </div>
                  <div className="mt-1 text-xs text-navy-300">
                    {p.count} avaliação(ões)
                    {p.latestDate && ` · última em ${formatDate(p.latestDate)}`}
                  </div>
                </div>
                {p.latestScore !== null && (
                  <span
                    className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      p.latestMeets
                        ? "bg-amber-100 text-amber-800"
                        : "bg-navy-100 text-navy-500"
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
