/**
 * FIQR — Questionário Revisado de Impacto da Fibromialgia
 * (Revised Fibromyalgia Impact Questionnaire, Bennett et al., 2009)
 *
 * 21 itens, todos de 0 a 10, em 3 domínios. Pontuação:
 *  - Função (9 itens): soma (0–90) ÷ 3  → 0–30
 *  - Impacto global (2 itens): soma       → 0–20
 *  - Sintomas (10 itens): soma (0–100) ÷ 2 → 0–50
 *  - TOTAL = Função + Impacto + Sintomas   → 0–100
 *
 * Em todos os itens, quanto MAIOR o número, MAIOR o impacto/gravidade.
 */

export interface FiqrItem {
  id: string;
  label: string;
  minLabel: string;
  maxLabel: string;
}

// Domínio 1 — Função (0 = sem dificuldade, 10 = incapaz de fazer)
export const FIQR_FUNCTION: FiqrItem[] = [
  { id: "f_cabelo", label: "Pentear o cabelo", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_andar", label: "Caminhar sem parar por 20 minutos", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_refeicao", label: "Preparar uma refeição caseira", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_limpar", label: "Passar aspirador, esfregar ou varrer o chão", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_compras_carregar", label: "Levantar e carregar uma sacola cheia de compras", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_escada", label: "Subir um lance de escadas", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_cama", label: "Trocar a roupa de cama", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_sentar", label: "Permanecer sentado(a) numa cadeira por 45 minutos", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
  { id: "f_mercado", label: "Fazer compras no mercado", minLabel: "Sem dificuldade", maxLabel: "Incapaz" },
];

// Domínio 2 — Impacto global (nos últimos 7 dias)
export const FIQR_OVERALL: FiqrItem[] = [
  { id: "o_objetivos", label: "A fibromialgia me impediu de alcançar meus objetivos da semana", minLabel: "Nunca", maxLabel: "Sempre" },
  { id: "o_dominado", label: "Senti-me completamente dominado(a) pelos sintomas da fibromialgia", minLabel: "Nunca", maxLabel: "Sempre" },
];

// Domínio 3 — Sintomas (intensidade nos últimos 7 dias)
export const FIQR_SYMPTOMS: FiqrItem[] = [
  { id: "s_dor", label: "Dor", minLabel: "Sem dor", maxLabel: "Dor intensa" },
  { id: "s_energia", label: "Falta de energia / cansaço", minLabel: "Muita energia", maxLabel: "Sem energia" },
  { id: "s_rigidez", label: "Rigidez (enrijecimento)", minLabel: "Sem rigidez", maxLabel: "Rigidez intensa" },
  { id: "s_sono", label: "Qualidade do sono", minLabel: "Dormi muito bem", maxLabel: "Dormi muito mal" },
  { id: "s_depressao", label: "Depressão", minLabel: "Sem depressão", maxLabel: "Depressão intensa" },
  { id: "s_memoria", label: "Problemas de memória", minLabel: "Boa memória", maxLabel: "Memória muito ruim" },
  { id: "s_ansiedade", label: "Ansiedade", minLabel: "Sem ansiedade", maxLabel: "Ansiedade intensa" },
  { id: "s_toque", label: "Sensibilidade/dor ao toque", minLabel: "Sem sensibilidade", maxLabel: "Muito sensível" },
  { id: "s_equilibrio", label: "Problemas de equilíbrio", minLabel: "Sem problemas", maxLabel: "Problemas graves" },
  { id: "s_ambiente", label: "Sensibilidade a barulhos, luzes, cheiros e frio", minLabel: "Sem sensibilidade", maxLabel: "Muito sensível" },
];

export const FIQR_ALL_ITEMS = [
  ...FIQR_FUNCTION,
  ...FIQR_OVERALL,
  ...FIQR_SYMPTOMS,
];

export type FiqrAnswers = Record<string, number>;

export interface FiqrResult {
  functionScore: number; // 0–30
  overallScore: number; // 0–20
  symptomsScore: number; // 0–50
  total: number; // 0–100
  category: { label: string; tone: "good" | "mild" | "moderate" | "severe" };
}

function sum(items: FiqrItem[], a: FiqrAnswers): number {
  return items.reduce((acc, it) => acc + clamp10(a[it.id]), 0);
}

function clamp10(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n)));
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function computeFiqr(a: FiqrAnswers): FiqrResult {
  const functionScore = r1(sum(FIQR_FUNCTION, a) / 3); // 0–30
  const overallScore = r1(sum(FIQR_OVERALL, a)); // 0–20
  const symptomsScore = r1(sum(FIQR_SYMPTOMS, a) / 2); // 0–50
  const total = r1(functionScore + overallScore + symptomsScore); // 0–100

  return { functionScore, overallScore, symptomsScore, total, category: categorize(total) };
}

/**
 * Faixas de referência de gravidade (Salaffi et al., 2012):
 *  remissão 0–23 · leve 24–40 · moderado 41–63 · grave 64–100
 */
export function categorize(total: number): FiqrResult["category"] {
  if (total <= 23) return { label: "Remissão", tone: "good" };
  if (total <= 40) return { label: "Impacto leve", tone: "mild" };
  if (total <= 63) return { label: "Impacto moderado", tone: "moderate" };
  return { label: "Impacto grave", tone: "severe" };
}

export function isFiqrComplete(a: FiqrAnswers): boolean {
  return FIQR_ALL_ITEMS.every((it) => typeof a[it.id] === "number");
}
