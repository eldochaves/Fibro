"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminRequestQuestionnaire,
  adminCancelRequest,
} from "@/app/actions";

export interface RequestItem {
  key: string;
  name: string;
  pending: boolean;
  hasRequest: boolean;
}

export function RequestQuestionnaire({
  userId,
  items,
}: {
  userId: string;
  items: RequestItem[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function request(key: string) {
    setBusy(key);
    const res = await adminRequestQuestionnaire(userId, key);
    setBusy(null);
    if (res.ok) router.refresh();
    else window.alert(res.error ?? "Não foi possível solicitar.");
  }

  async function cancel(key: string) {
    setBusy(key);
    const res = await adminCancelRequest(userId, key);
    setBusy(null);
    if (res.ok) router.refresh();
    else window.alert(res.error ?? "Não foi possível cancelar.");
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-navy-400">
        Nenhum questionário liberado ainda. Libere acima para poder solicitar
        respostas.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li
          key={it.key}
          className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 px-3 py-2"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-navy-800">
              {it.name}
            </div>
            <div className="text-xs">
              {it.pending ? (
                <span className="text-amber-700">⏳ Em aberto (aguardando)</span>
              ) : (
                <span className="text-navy-400">✓ Respondido</span>
              )}
            </div>
          </div>
          {it.pending ? (
            it.hasRequest ? (
              <button
                type="button"
                onClick={() => cancel(it.key)}
                disabled={busy === it.key}
                className="shrink-0 text-xs font-medium text-navy-500 hover:text-red-600 disabled:opacity-50"
              >
                {busy === it.key ? "..." : "Cancelar"}
              </button>
            ) : (
              <span className="shrink-0 text-xs text-navy-300">disponível</span>
            )
          ) : (
            <button
              type="button"
              onClick={() => request(it.key)}
              disabled={busy === it.key}
              className="btn-outline shrink-0 px-3 py-1.5 text-sm"
            >
              {busy === it.key ? "..." : "Solicitar nova resposta"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
