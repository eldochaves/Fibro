/**
 * Nome exibido no site. Personalize definindo a variável de ambiente
 * NEXT_PUBLIC_CLINIC_NAME (ex.: "Clínica Dr. Eldo Chaves").
 */
export const CLINIC_NAME =
  process.env.NEXT_PUBLIC_CLINIC_NAME?.trim() || "Avaliação de Fibromialgia";
