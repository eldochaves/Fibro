/**
 * Nome exibido no site. Personalize definindo a variável de ambiente
 * NEXT_PUBLIC_CLINIC_NAME (ex.: "Clínica Dr. Eldo Chaves").
 */
export const CLINIC_NAME =
  process.env.NEXT_PUBLIC_CLINIC_NAME?.trim() || "Clínica Dr. Eldo Chaves";

/** Endereço público do site (usado em mensagens/links). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://fibro.vercel.app"
).replace(/\/$/, "");
