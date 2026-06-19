/**
 * STarT Back Screening Tool — triagem de risco de cronificação/incapacidade
 * por dor lombar (Keele University). 9 itens.
 *
 *  - Itens 1–8: Discordo (0) / Concordo (1)
 *  - Item 9 (incômodo): Nada/Pouco/Moderadamente = 0 · Muito/Extremamente = 1
 *
 * Escore total (0–9) e subescala psicossocial = itens 5–9 (0–5).
 * Estratificação:
 *  - Total ≤ 3 → risco BAIXO
 *  - Total ≥ 4 e psicossocial ≤ 3 → risco MÉDIO
 *  - Psicossocial ≥ 4 → risco ALTO
 *
 * ⚠️ Conferir os enunciados com a versão validada em PT-BR (Pilz et al., 2014).
 */
import type { ScoredDef, ScoredAnswers } from "@/lib/scored";
import { scoredQuestions } from "@/lib/scored";

const AGREE = [
  { label: "Discordo", value: 0 },
  { label: "Concordo", value: 1 },
];

const PSYCH_IDS = ["sb5", "sb6", "sb7", "sb8", "sb9"];

function valueOf(def: ScoredDef, id: string, a: ScoredAnswers): number {
  const q = scoredQuestions(def).find((x) => x.id === id);
  const idx = a[id];
  return q && typeof idx === "number" ? q.options[idx].value : 0;
}

export const STARTBACK: ScoredDef = {
  key: "startback",
  name: "STarT Back — triagem de risco (lombar)",
  intro:
    "Pensando nas últimas 2 semanas, indique se concorda ou discorda de cada afirmação.",
  maxScore: 9,
  sections: [
    {
      title: "Sintomas físicos",
      questions: [
        { id: "sb1", label: "Minha dor nas costas se espalhou para a(s) perna(s) em algum momento", options: AGREE },
        { id: "sb2", label: "Tive dor no ombro ou no pescoço em algum momento", options: AGREE },
        { id: "sb3", label: "Tenho andado apenas distâncias curtas por causa da dor nas costas", options: AGREE },
        { id: "sb4", label: "Eu me vesti mais devagar que o normal por causa da dor nas costas", options: AGREE },
      ],
    },
    {
      title: "Como você tem se sentido",
      questions: [
        { id: "sb5", label: "Não é realmente seguro, para uma pessoa na minha condição, ser fisicamente ativa", options: AGREE },
        { id: "sb6", label: "Pensamentos preocupantes têm passado pela minha cabeça boa parte do tempo", options: AGREE },
        { id: "sb7", label: "Sinto que minha dor nas costas é terrível e que nunca vai melhorar", options: AGREE },
        { id: "sb8", label: "Em geral, não tenho aproveitado as coisas como costumava", options: AGREE },
        {
          id: "sb9",
          label: "De modo geral, o quanto a dor nas costas tem lhe incomodado nas últimas 2 semanas?",
          options: [
            { label: "Nada", value: 0 },
            { label: "Pouco", value: 0 },
            { label: "Moderadamente", value: 0 },
            { label: "Muito", value: 1 },
            { label: "Extremamente", value: 1 },
          ],
        },
      ],
    },
  ],
  categoryFn: (total, a, def) => {
    const psy = PSYCH_IDS.reduce((s, id) => s + valueOf(def, id, a), 0);
    const tier =
      psy >= 4 ? "Risco alto" : total >= 4 ? "Risco médio" : "Risco baixo";
    return `${tier} (total ${total}/9 · psicossocial ${psy}/5)`;
  },
};
