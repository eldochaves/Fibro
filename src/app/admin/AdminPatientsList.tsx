"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { DISEASE_LABEL } from "@/lib/questionnaires";

export interface PatientSummary {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  diseases: string[];
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
                className="card flex h-full items-center gap-3 transition hover:border-teal-300 hover:shadow-card"
              >
                <Avatar url={p.avatarUrl} name={p.fullName} size={44} />
                <div className="min-w-0 flex-1">
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
