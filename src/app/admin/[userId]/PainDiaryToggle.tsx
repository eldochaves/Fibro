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
  const [mailtoLink, setMailtoLink] = useState<string | null>(null);
  const [autoSent, setAutoSent] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(next: boolean) {
    setLoading(true);
    setError(null);
    setWaLink(null);
    setMailtoLink(null);
    setAutoSent(false);
    setShowNotify(false);

    const res = await adminSetPainDiary(userId, next);
    setLoading(false);

    if (!res.ok) {
      setError(res.error ?? "Não foi possível atualizar.");
      return;
    }

    // Usa o valor realmente salvo no banco (autoritativo)
    setEnabled(res.enabled);
    router.refresh();

    if (res.enabled && res.notified) {
      setWaLink(res.whatsappLink ?? null);
      setMailtoLink(res.mailtoLink ?? null);
      setAutoSent(res.emailStatus === "sent");
      setShowNotify(true);
    }
  }

  return (
    <div className="rounded-xl border border-navy-200 p-4 print:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-navy-800">
            📒 Diário de Dor
          </div>
          <div className="text-xs text-navy-400">
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

      {showNotify && (
        <div className="mt-3 space-y-2 rounded-lg bg-navy-50 p-3 text-sm">
          <p className="font-medium text-navy-700">
            Avisar o paciente:
          </p>
          {autoSent && (
            <p className="text-teal-700">✅ Email enviado automaticamente.</p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ backgroundColor: "#25D366" }}
              >
                💬 Enviar WhatsApp
              </a>
            )}
            {mailtoLink && !autoSent && (
              <a href={mailtoLink} className="btn-outline">
                ✉️ Enviar e-mail
              </a>
            )}
          </div>

          {!waLink && !mailtoLink && (
            <p className="text-xs text-navy-400">
              Sem telefone ou email cadastrado para avisar o paciente.
            </p>
          )}
          <p className="text-xs text-navy-400">
            Os botões abrem o WhatsApp/email com a mensagem pronta — basta
            enviar.
          </p>
        </div>
      )}
    </div>
  );
}
