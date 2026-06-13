/**
 * Envio de email transacional via Resend (https://resend.com).
 * Configure as variáveis de ambiente:
 *   RESEND_API_KEY  — chave da API (obrigatória para enviar)
 *   RESEND_FROM     — remetente verificado, ex.: "Clínica <noreply@seudominio.com>"
 *
 * Se RESEND_API_KEY não estiver definida, o envio é ignorado silenciosamente
 * (o app continua funcionando normalmente, apenas sem email).
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };

  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "erro" };
  }
}
