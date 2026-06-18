/**
 * EVA — Escala Visual Analógica de dor (0 a 10).
 * 0 = sem dor · 10 = pior dor imaginável.
 */
export type EvaAnswers = { eva: number };

export function isEvaComplete(a: EvaAnswers): boolean {
  return typeof a.eva === "number";
}

export function computeEva(a: EvaAnswers): { total: number } {
  const v = a.eva;
  return { total: typeof v === "number" ? Math.max(0, Math.min(10, v)) : 0 };
}
