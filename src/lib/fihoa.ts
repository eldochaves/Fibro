/**
 * FIHOA — Functional Index for Hand OsteoArthritis (Dreiser).
 * 10 itens, cada um de 0 a 3 (0 = sem dificuldade … 3 = impossível).
 * Total 0–30 (quanto maior, pior a função das mãos). Validado PT-BR.
 */
import type { ScoredDef, ScoredQuestion } from "@/lib/scored";

const OPTS = [
  { label: "Sem dificuldade", value: 0 },
  { label: "Com pouca dificuldade", value: 1 },
  { label: "Com muita dificuldade", value: 2 },
  { label: "Impossível", value: 3 },
];

function q(id: string, label: string): ScoredQuestion {
  return { id, label, options: OPTS };
}

export const FIHOA: ScoredDef = {
  key: "fihoa",
  name: "FIHOA — Função das mãos",
  maxScore: 30,
  sections: [
    {
      title: "Função das mãos",
      subtitle: "Qual o grau de dificuldade para…",
      questions: [
        q("f1", "Girar uma chave na fechadura"),
        q("f2", "Cortar carne com a faca"),
        q("f3", "Cortar tecido ou papel com a tesoura"),
        q("f4", "Levantar uma garrafa cheia com a mão"),
        q("f5", "Fechar o punho completamente"),
        q("f6", "Dar um nó (amarrar)"),
        q("f7", "Costurar (mulheres) ou usar chave de fenda (homens)"),
        q("f8", "Abotoar botões"),
        q("f9", "Escrever por um longo período"),
        q("f10", "Aceitar um aperto de mão sem hesitar (sem dor)"),
      ],
    },
  ],
};
