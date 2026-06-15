/**
 * PCS — Pain Catastrophizing Scale (Escala de Catastrofização da Dor)
 * Sullivan et al., 1995. Versão brasileira validada (Sehn et al., 2012).
 *
 * 13 itens, cada um de 0 a 4 (0 = nem um pouco … 4 = o tempo todo). Total 0–52.
 * Subescalas:
 *   - Ruminação: itens 8, 9, 10, 11
 *   - Magnificação: itens 6, 7, 13
 *   - Desamparo: itens 1, 2, 3, 4, 5, 12
 * Ponto de corte clínico para catastrofização relevante: total ≥ 30.
 */

export const PCS_OPTIONS = [
  "Nem um pouco",
  "Um pouco",
  "Moderadamente",
  "Bastante",
  "O tempo todo",
];

// Ordem oficial (1..13)
export const PCS_ITEMS: { id: string; label: string }[] = [
  { id: "p1", label: "Fico preocupado(a) o tempo todo se a dor vai passar." },
  { id: "p2", label: "Sinto que não consigo mais continuar." },
  { id: "p3", label: "É terrível e penso que nunca vai melhorar." },
  { id: "p4", label: "É horrível e sinto que a dor toma conta de mim." },
  { id: "p5", label: "Sinto que não aguento mais." },
  { id: "p6", label: "Fico com medo de que a dor piore." },
  { id: "p7", label: "Fico pensando em outras situações dolorosas." },
  { id: "p8", label: "Desejo ansiosamente que a dor desapareça." },
  { id: "p9", label: "Não consigo afastar a dor da minha mente." },
  { id: "p10", label: "Fico o tempo todo pensando em como a dor me machuca." },
  { id: "p11", label: "Fico o tempo todo pensando o quanto quero que a dor pare." },
  { id: "p12", label: "Não há nada que eu possa fazer para reduzir a intensidade da dor." },
  { id: "p13", label: "Fico imaginando se algo grave pode acontecer." },
];

const RUMINATION = ["p8", "p9", "p10", "p11"];
const MAGNIFICATION = ["p6", "p7", "p13"];
const HELPLESSNESS = ["p1", "p2", "p3", "p4", "p5", "p12"];

// Pontos de corte clínicos (percentil 75 em dor crônica) e faixas máximas
export const PCS_CUTOFFS = {
  total: 30, // ≥ 30 = catastrofização clinicamente relevante
  rumination: 11, // > 11
  magnification: 5, // > 5
  helplessness: 13, // > 13
};
export const PCS_MAX = {
  total: 52,
  rumination: 16,
  magnification: 12,
  helplessness: 24,
};

export type PcsAnswers = Record<string, number>;

export interface PcsResult {
  total: number; // 0–52
  rumination: number; // 0–16
  magnification: number; // 0–12
  helplessness: number; // 0–24
  /** Nível de severidade do escore total. */
  category: { label: string; tone: "good" | "mild" | "moderate" | "severe" };
  /** Total ≥ 30 (percentil 75) — catastrofização clinicamente relevante. */
  clinical: boolean;
  /** Subescalas acima do ponto de corte clínico. */
  subClinical: {
    rumination: boolean;
    magnification: boolean;
    helplessness: boolean;
  };
}

export function isPcsComplete(a: PcsAnswers): boolean {
  return PCS_ITEMS.every((it) => typeof a[it.id] === "number");
}

function sum(ids: string[], a: PcsAnswers): number {
  return ids.reduce((acc, id) => {
    const v = a[id];
    return acc + (typeof v === "number" ? Math.max(0, Math.min(4, v)) : 0);
  }, 0);
}

export function computePcs(a: PcsAnswers): PcsResult {
  const rumination = sum(RUMINATION, a);
  const magnification = sum(MAGNIFICATION, a);
  const helplessness = sum(HELPLESSNESS, a);
  const total = rumination + magnification + helplessness;
  return {
    total,
    rumination,
    magnification,
    helplessness,
    category: categorizePcs(total),
    clinical: total >= PCS_CUTOFFS.total,
    subClinical: {
      rumination: rumination > PCS_CUTOFFS.rumination,
      magnification: magnification > PCS_CUTOFFS.magnification,
      helplessness: helplessness > PCS_CUTOFFS.helplessness,
    },
  };
}

/**
 * Níveis de severidade do escore total (manual do PCS, Sullivan):
 *  baixo 0–9 · moderado 10–19 · alto 20–39 · muito alto 40–52
 */
export function categorizePcs(total: number): PcsResult["category"] {
  if (total <= 9) return { label: "Baixo", tone: "good" };
  if (total <= 19) return { label: "Moderado", tone: "mild" };
  if (total <= 39) return { label: "Alto", tone: "moderate" };
  return { label: "Muito alto", tone: "severe" };
}
