/**
 * Motor genérico de questionário Likert por subescalas com escore
 * NORMALIZADO 0–100 (KOOS / HOOS).
 *
 * Cada item é respondido de 0 a 4 (5 âncoras). Para cada subescala calcula-se
 * a média dos itens e normaliza-se:
 *
 *     escore_subescala = 100 − (média_itens × 25)
 *
 * de modo que 100 = sem queixas (melhor) e 0 = queixas extremas (pior).
 * Ou seja, neste instrumento MAIOR = MELHOR (ao contrário do WOMAC/Lequesne).
 *
 * O escore global exibido é a média das subescalas (também 0–100, maior=melhor).
 */

export interface LikertItem {
  id: string;
  label: string;
  /** Âncoras próprias (5 rótulos, valor 0..4). Sobrepõe as da subescala/def. */
  options?: string[];
}
export interface LikertSubscale {
  key: string;
  title: string;
  subtitle?: string;
  /** Âncoras da subescala (5 rótulos). Sobrepõe as do def. */
  options?: string[];
  items: LikertItem[];
}
export interface LikertDef {
  key: string;
  name: string;
  intro?: string;
  /** Âncoras padrão (5 rótulos, índice 0..4). */
  options: string[];
  subscales: LikertSubscale[];
}

/** Respostas: { itemId: valor escolhido 0..4 } */
export type LikertAnswers = Record<string, number>;

export function likertItems(def: LikertDef): LikertItem[] {
  return def.subscales.flatMap((s) => s.items);
}

/** Âncoras efetivas de um item (item > subescala > def). */
export function likertOptionsFor(
  def: LikertDef,
  sub: LikertSubscale,
  item: LikertItem
): string[] {
  return item.options ?? sub.options ?? def.options;
}

export function isLikertComplete(def: LikertDef, a: LikertAnswers): boolean {
  return likertItems(def).every((it) => typeof a[it.id] === "number");
}

export interface LikertSubscaleResult {
  key: string;
  title: string;
  score: number; // 0–100 (maior = melhor)
}
export interface LikertResult {
  score: number; // global 0–100 (maior = melhor)
  subscales: LikertSubscaleResult[];
}

export function computeLikert(def: LikertDef, a: LikertAnswers): LikertResult {
  const subscales: LikertSubscaleResult[] = def.subscales.map((sub) => {
    const vals = sub.items
      .map((it) => a[it.id])
      .filter((v): v is number => typeof v === "number");
    // Sem itens respondidos: subescala indefinida (tratada como 0 de queixa).
    const mean = vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    const score = Math.round(100 - mean * 25);
    return { key: sub.key, title: sub.title, score };
  });
  const score =
    subscales.length > 0
      ? Math.round(
          subscales.reduce((s, x) => s + x.score, 0) / subscales.length
        )
      : 0;
  return { score, subscales };
}
