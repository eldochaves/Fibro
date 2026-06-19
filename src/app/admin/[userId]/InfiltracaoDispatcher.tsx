"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSendInfiltracao } from "@/app/actions";
import { TENDINITE_SUBTYPES } from "@/lib/questionnaires";

export function InfiltracaoDispatcher({
  userId,
  initialSites,
}: {
  userId: string;
  initialSites: string[];
}) {
  const router = useRouter();
  const [sites, setSites] = useState<string[]>(initialSites);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string) {
    setDone(false);
    setSites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function send() {
    setSaving(true);
    setError(null);
    const res = await adminSendInfiltracao(userId, sites);
    setSaving(false);
    if (res.ok) {
      setDone(true);
      router.refresh();
    } else {
      setError(res.error ?? "Não foi possível encaminhar.");
    }
  }

  return (
    <div className="card print:hidden">
      <h2 className="font-display text-lg font-semibold text-navy-800">
        💉 Feedback pós-infiltração
      </h2>
      <p className="mb-3 mt-1 text-sm text-navy-500">
        Marque quais tendinites foram infiltradas e libere o feedback para o
        paciente responder.
      </p>

      <div className="flex flex-wrap gap-2">
        {TENDINITE_SUBTYPES.map((s) => {
          const active = sites.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
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

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={send}
          disabled={saving || sites.length === 0}
          className="btn-primary"
        >
          {saving ? "Encaminhando..." : "Liberar feedback para o paciente"}
        </button>
        {done && (
          <span className="text-sm text-teal-700">
            ✓ Liberado — disponível no início do paciente
          </span>
        )}
      </div>
    </div>
  );
}
