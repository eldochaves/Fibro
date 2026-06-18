"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { buildWhatsappLink, buildMailtoLink } from "@/lib/whatsapp";
import { adminDismissPendency } from "@/app/actions";

export interface ReminderItem {
  userId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  questionnaireKey: string;
  questionnaireName: string;
  reason: string;
}

export function LembretesList({
  items,
  siteUrl,
}: {
  items: ReminderItem[];
  siteUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function dismiss(userId: string, key: string) {
    if (!window.confirm("Dispensar esta pendência?")) return;
    setBusy(`${userId}-${key}`);
    const res = await adminDismissPendency(userId, key);
    setBusy(null);
    if (res.ok) router.refresh();
    else window.alert(res.error ?? "Não foi possível dispensar.");
  }

  if (items.length === 0) {
    return (
      <div className="card text-center text-navy-500">
        <div className="mb-2 text-3xl">✅</div>
        Nenhuma pendência no momento.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const first = (it.name ?? "").split(" ")[0] || "Olá";
        const link = `${siteUrl}/c/${it.questionnaireKey}`;
        const msg =
          `Olá ${first}! Chegou o momento de responder o questionário ` +
          `"${it.questionnaireName}" no seu acompanhamento com o Dr. Eldo Chaves. ` +
          `É rápido e gratuito: ${link}`;
        const wa = buildWhatsappLink(it.phone, msg);
        const mail = buildMailtoLink(
          it.email,
          `${it.questionnaireName} — Dr. Eldo Chaves`,
          msg
        );
        return (
          <li
            key={`${it.userId}-${it.questionnaireKey}`}
            className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar url={it.avatarUrl} name={it.name} size={40} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-800">
                  {it.name || "(sem nome)"}
                </div>
                <div className="text-xs text-navy-500">
                  {it.questionnaireName}
                </div>
                <div className="text-xs text-navy-300">{it.reason}</div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-3 py-2 text-sm"
                  style={{ backgroundColor: "#25D366" }}
                >
                  💬 WhatsApp
                </a>
              ) : (
                <span className="self-center text-xs text-navy-300">
                  sem telefone
                </span>
              )}
              {mail && (
                <a href={mail} className="btn-outline px-3 py-2 text-sm">
                  ✉️ E-mail
                </a>
              )}
              <button
                type="button"
                onClick={() => dismiss(it.userId, it.questionnaireKey)}
                disabled={busy === `${it.userId}-${it.questionnaireKey}`}
                className="px-2 py-2 text-sm font-medium text-navy-400 hover:text-red-600 disabled:opacity-50"
                title="Dispensar pendência"
              >
                Dispensar
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
