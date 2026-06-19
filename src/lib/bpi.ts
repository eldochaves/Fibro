/**
 * BPI — Brief Pain Inventory (Inventário Breve de Dor, Cleeland).
 * Dois domínios, todos os itens de 0 a 10:
 *  - Gravidade da dor (4 itens): pior, mais fraca, média e agora → média 0–10
 *  - Interferência da dor (7 itens) → média 0–10
 * Em ambos, quanto MAIOR, pior.
 *
 * ⚠️ Conferir os enunciados com a versão validada em PT-BR (Ferreira et al.).
 */
export interface BpiItem {
  id: string;
  label: string;
  minLabel: string;
  maxLabel: string;
}

export const BPI_SEVERITY: BpiItem[] = [
  { id: "s_pior", label: "A PIOR dor nas últimas 24 horas", minLabel: "Sem dor", maxLabel: "Pior dor imaginável" },
  { id: "s_fraca", label: "A dor MAIS FRACA nas últimas 24 horas", minLabel: "Sem dor", maxLabel: "Pior dor imaginável" },
  { id: "s_media", label: "A dor MÉDIA (em geral)", minLabel: "Sem dor", maxLabel: "Pior dor imaginável" },
  { id: "s_agora", label: "A dor AGORA (neste momento)", minLabel: "Sem dor", maxLabel: "Pior dor imaginável" },
];

export const BPI_INTERFERENCE: BpiItem[] = [
  { id: "i_atividade", label: "Atividade geral", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_humor", label: "Humor", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_caminhar", label: "Capacidade de caminhar", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_trabalho", label: "Trabalho (dentro e fora de casa)", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_relacoes", label: "Relacionamento com outras pessoas", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_sono", label: "Sono", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
  { id: "i_prazer", label: "Capacidade de aproveitar a vida", minLabel: "Não interferiu", maxLabel: "Interferiu por completo" },
];

export const BPI_ALL_ITEMS = [...BPI_SEVERITY, ...BPI_INTERFERENCE];

export type BpiAnswers = Record<string, number>;

export interface BpiResult {
  severity: number; // média 0–10
  interference: number; // média 0–10
}

function clamp10(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n)));
}
const r1 = (n: number) => Math.round(n * 10) / 10;

function mean(items: BpiItem[], a: BpiAnswers): number {
  if (items.length === 0) return 0;
  return r1(items.reduce((acc, it) => acc + clamp10(a[it.id]), 0) / items.length);
}

export function computeBpi(a: BpiAnswers): BpiResult {
  return {
    severity: mean(BPI_SEVERITY, a),
    interference: mean(BPI_INTERFERENCE, a),
  };
}

export function isBpiComplete(a: BpiAnswers): boolean {
  return BPI_ALL_ITEMS.every((it) => typeof a[it.id] === "number");
}
