/**
 * AUSCAN — Australian/Canadian Hand Osteoarthritis Index (versão Likert, LK 3.1).
 * 15 itens em 3 dimensões: Dor (5), Rigidez (1) e Função (9). Cada item de
 * 0 a 4 (0 = nenhuma … 4 = extrema). Total 0–60 — quanto MAIOR, pior.
 *
 * ⚠️ Conferir os enunciados com a versão validada em português antes de usar
 * na clínica.
 */
import type { ScoredDef, ScoredQuestion } from "@/lib/scored";

const OPTS = [
  { label: "Nenhuma", value: 0 },
  { label: "Leve", value: 1 },
  { label: "Moderada", value: 2 },
  { label: "Intensa", value: 3 },
  { label: "Extrema", value: 4 },
];

function q(id: string, label: string): ScoredQuestion {
  return { id, label, options: OPTS };
}

export const AUSCAN: ScoredDef = {
  key: "auscan",
  name: "AUSCAN — Mãos",
  intro:
    "Pense nas suas mãos nas últimas 48 horas ao responder.",
  maxScore: 60,
  sections: [
    {
      title: "Dor",
      subtitle: "Qual a intensidade da dor nas mãos ao…",
      questions: [
        q("p1", "Segurar (agarrar) objetos"),
        q("p2", "Levantar objetos"),
        q("p3", "Girar objetos (torneiras, maçanetas)"),
        q("p4", "Apertar (espremer) objetos"),
        q("p5", "Dor nas mãos em repouso"),
      ],
    },
    {
      title: "Rigidez",
      questions: [
        q(
          "s1",
          "Qual a intensidade da rigidez das mãos logo após acordar de manhã?"
        ),
      ],
    },
    {
      title: "Função",
      subtitle: "Qual o grau de dificuldade para…",
      questions: [
        q("f1", "Abrir uma torneira"),
        q("f2", "Girar uma maçaneta redonda"),
        q("f3", "Abotoar botões"),
        q("f4", "Fechar um fecho/colar (bijuteria)"),
        q("f5", "Abrir um pote novo (pela primeira vez)"),
        q("f6", "Carregar uma panela cheia com uma das mãos"),
        q("f7", "Descascar legumes ou frutas"),
        q("f8", "Pegar objetos grandes ou pesados"),
        q("f9", "Torcer um pano (espremer)"),
      ],
    },
  ],
};
