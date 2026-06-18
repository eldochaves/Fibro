/**
 * WOMAC — Western Ontario and McMaster Universities Osteoarthritis Index
 * (versão LK 3.1, validada para o Brasil — Fernandes, 2003)
 *
 * 24 itens, cada um de 0 a 4. Três domínios:
 *   - Dor (5 itens) → 0–20
 *   - Rigidez (2 itens) → 0–8
 *   - Função física (17 itens) → 0–68
 *   - TOTAL → 0–96  (quanto maior, pior)
 * Aplica-se a osteoartrite de joelho e quadril.
 */

export const WOMAC_OPTIONS = [
  "Nenhuma",
  "Pouca",
  "Moderada",
  "Intensa",
  "Muito intensa",
];

export interface WomacSection {
  id: "pain" | "stiffness" | "function";
  title: string;
  subtitle: string;
  items: { id: string; label: string }[];
}

export const WOMAC_SECTIONS: WomacSection[] = [
  {
    id: "pain",
    title: "Dor",
    subtitle: "Quanta dor você sente ao…",
    items: [
      { id: "p1", label: "Caminhar em uma superfície plana" },
      { id: "p2", label: "Subir ou descer escadas" },
      { id: "p3", label: "À noite, deitado na cama" },
      { id: "p4", label: "Sentado ou deitado" },
      { id: "p5", label: "Ficar em pé" },
    ],
  },
  {
    id: "stiffness",
    title: "Rigidez",
    subtitle: "Quanta rigidez (enrijecimento) você sente…",
    items: [
      { id: "s1", label: "Ao acordar de manhã" },
      {
        id: "s2",
        label:
          "Depois de ficar sentado, deitado ou em repouso, no resto do dia",
      },
    ],
  },
  {
    id: "function",
    title: "Função física",
    subtitle: "Qual o grau de dificuldade para…",
    items: [
      { id: "f1", label: "Descer escadas" },
      { id: "f2", label: "Subir escadas" },
      { id: "f3", label: "Levantar-se estando sentado" },
      { id: "f4", label: "Ficar em pé" },
      { id: "f5", label: "Abaixar-se / curvar-se para pegar algo" },
      { id: "f6", label: "Andar em superfície plana" },
      { id: "f7", label: "Entrar e sair do carro" },
      { id: "f8", label: "Ir fazer compras" },
      { id: "f9", label: "Colocar meias / meia-calça" },
      { id: "f10", label: "Levantar-se da cama" },
      { id: "f11", label: "Tirar as meias / meia-calça" },
      { id: "f12", label: "Ficar deitado na cama" },
      { id: "f13", label: "Entrar e sair do banho / banheira" },
      { id: "f14", label: "Sentar-se" },
      { id: "f15", label: "Sentar e levantar do vaso sanitário" },
      { id: "f16", label: "Fazer tarefas domésticas pesadas" },
      { id: "f17", label: "Fazer tarefas domésticas leves" },
    ],
  },
];

export const WOMAC_ITEMS = WOMAC_SECTIONS.flatMap((s) => s.items);

export type WomacAnswers = Record<string, number>;

export interface WomacResult {
  pain: number; // 0–20
  stiffness: number; // 0–8
  function: number; // 0–68
  total: number; // 0–96
}

export function isWomacComplete(a: WomacAnswers): boolean {
  return WOMAC_ITEMS.every((it) => typeof a[it.id] === "number");
}

function sum(items: { id: string }[], a: WomacAnswers): number {
  return items.reduce((acc, it) => {
    const v = a[it.id];
    return acc + (typeof v === "number" ? Math.max(0, Math.min(4, v)) : 0);
  }, 0);
}

export function computeWomac(a: WomacAnswers): WomacResult {
  const pain = sum(WOMAC_SECTIONS[0].items, a);
  const stiffness = sum(WOMAC_SECTIONS[1].items, a);
  const fn = sum(WOMAC_SECTIONS[2].items, a);
  return { pain, stiffness, function: fn, total: pain + stiffness + fn };
}
