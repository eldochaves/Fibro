/**
 * Monta um link wa.me com mensagem pronta. O médico clica e envia pelo
 * próprio WhatsApp (não exige API paga).
 *
 * @param phone telefone do paciente (com ou sem máscara). Assume Brasil (+55)
 *              quando não houver código de país.
 */
export function buildWhatsappLink(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null; // telefone inválido/incompleto
  if (!digits.startsWith("55")) digits = "55" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Link que abre preferencialmente o WhatsApp BUSINESS no Android, via "intent"
 * apontando para o pacote do app comercial (com.whatsapp.w4b). Só funciona no
 * Android (navegador); em iPhone/desktop o esquema é ignorado — por isso o app
 * deve oferecer também o link wa.me comum como alternativa.
 */
export function buildWhatsappBusinessLink(
  phone: string | null | undefined,
  message: string
): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (!digits.startsWith("55")) digits = "55" + digits;
  return (
    `intent://send?phone=${digits}&text=${encodeURIComponent(message)}` +
    `#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`
  );
}

/**
 * Monta um link mailto: com assunto e corpo prontos. O médico clica e envia
 * pelo próprio aplicativo de email (não exige domínio nem serviço externo).
 */
export function buildMailtoLink(
  email: string | null | undefined,
  subject: string,
  body: string
): string | null {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

