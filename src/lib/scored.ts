/**
 * Motor genérico de questionário por "escolhas pontuadas":
 * cada pergunta tem opções com um valor; o escore é a soma dos valores
 * escolhidos. Usado pelo Lequesne (e reutilizável por outros instrumentos).
 */

export interface ScoredOption {
  label: string;
  value: number;
}
export interface ScoredQuestion {
  id: string;
  label: string;
  options: ScoredOption[];
}
export interface ScoredSection {
  title?: string;
  subtitle?: string;
  questions: ScoredQuestion[];
}
export interface ScoredCategory {
  max: number; // total <= max
  label: string;
}
export interface ScoredDef {
  key: string;
  name: string;
  intro?: string;
  maxScore: number;
  sections: ScoredSection[];
  categories?: ScoredCategory[];
}

/** Respostas: { questionId: índice da opção escolhida } */
export type ScoredAnswers = Record<string, number>;

export function scoredQuestions(def: ScoredDef): ScoredQuestion[] {
  return def.sections.flatMap((s) => s.questions);
}

export function isScoredComplete(def: ScoredDef, a: ScoredAnswers): boolean {
  return scoredQuestions(def).every((q) => typeof a[q.id] === "number");
}

export function computeScored(
  def: ScoredDef,
  a: ScoredAnswers
): { total: number; category: string | null } {
  let total = 0;
  for (const q of scoredQuestions(def)) {
    const idx = a[q.id];
    const opt = typeof idx === "number" ? q.options[idx] : undefined;
    if (opt) total += opt.value;
  }
  total = Math.round(total * 10) / 10;
  let category: string | null = null;
  if (def.categories) {
    for (const c of def.categories) {
      if (total <= c.max) {
        category = c.label;
        break;
      }
    }
  }
  return { total, category };
}
