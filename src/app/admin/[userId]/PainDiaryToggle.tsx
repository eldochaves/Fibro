"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminSetPainDiary } from "@/app/actions";

export function PainDiaryToggle({
  userId,
  initialEnabled,
}: {
  userId: string;
  initialEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [waLink, setWaLink] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setLoading(true);
    setError(null);
    setWaLink(null);
    setEmailStatus(null);

    const res = await adminSetPainDiary(userId, next);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Não foi possível atualizar.");
      return;
    }

    setEnabled(next);
    router.refresh();

    if (next && res.notified) {
      setWaLink(res.whatsappLink ?? null);
      if (res.emailStatus === "sent")
        setEmailStatus("✅ Email enviado ao paciente.");
      else if (res.emailStatus === "error")
        setEmailStatus("⚠️ Não foi possível enviar o email.");
      else
        setEmailStatus(
          "ℹ️ Email não configurado (defina RESEND_API_KEY para envio automático)."
        );
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 print:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            📒 Diário de Dor
          </div>
          <div className="text-xs text-slate-500">
            {enabled
              ? "Habilitado para este paciente."
              : "Desabilitado. Habilite para o paciente registrar episódios."}
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggle(!enabled)}
          disabled={loading}
          className={enabled ? "btn-outline" : "btn-primary"}
        >
          {loading ? "..." : enabled ? "Desabilitar" : "Habilitar"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {(emailStatus || waLink) && (
        <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
          {emailStatus && <p className="text-slate-600">{emailStatus}</p>}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full"
              style={{ backgroundColor: "#25D366" }}
            >
              Enviar aviso por WhatsApp
            </a>
          ) : (
            <p className="text-xs text-slate-500">
              Sem telefone cadastrado para gerar o link de WhatsApp.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
