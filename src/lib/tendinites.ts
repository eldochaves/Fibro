/**
 * Instrumentos para TENDINITES (predominantemente ortopédicas).
 * PROMs validados (versões PT-BR): QuickDASH, SPADI, PRTEE; e VISA-P / VISA-A
 * para tendinopatias de membro inferior.
 *
 * Implementação: usamos o motor "scored" (soma de valores das opções). Para que
 * a SOMA já seja o escore na escala oficial (0–100), o valor de cada opção é
 * ponderado por item (truque de pesos). Quando a escala é 0–10 por item, o
 * formulário mostra uma grade horizontal automaticamente.
 *
 * ⚠️ Conferir enunciados e pontuação com as versões validadas em PT-BR antes do
 * uso clínico. Em especial, a Q8 do VISA-P/VISA-A foi simplificada.
 */
import type { ScoredDef, ScoredOption, ScoredQuestion } from "@/lib/scored";

/** 11 opções numéricas 0..10, valor = fator × índice. */
function scale(factor = 1): ScoredOption[] {
  return Array.from({ length: 11 }, (_, i) => ({
    label: String(i),
    value: Math.round(i * factor * 1000) / 1000,
  }));
}
function nrs(id: string, label: string, factor = 1): ScoredQuestion {
  return { id, label, options: scale(factor) };
}

// ---------------------------------------------------------------------
// QuickDASH — 11 itens, cada um 1–5. Escore = (média − 1) × 25 (0–100).
// valor da opção = índice × 25/11  →  soma das 11 = escore. Maior = pior.
// ---------------------------------------------------------------------
const QF = 25 / 11;
function qd(id: string, label: string, labels: string[]): ScoredQuestion {
  return {
    id,
    label,
    options: labels.map((l, i) => ({ label: l, value: i * QF })),
  };
}
const DIFF = ["Nenhuma dificuldade", "Pouca", "Moderada", "Muita", "Incapaz"];
const SEV = ["Nenhuma", "Leve", "Moderada", "Intensa", "Extrema"];

export const QUICKDASH: ScoredDef = {
  key: "quickdash",
  name: "QuickDASH — função do braço/ombro/mão",
  intro:
    "Pense na sua capacidade na última semana. Responda todos os itens (mesmo que estime).",
  maxScore: 100,
  sections: [
    {
      title: "Atividades",
      subtitle: "Qual a sua dificuldade para…",
      questions: [
        qd("q1", "Abrir um pote ou vidro novo (apertado)", DIFF),
        qd("q2", "Fazer tarefas domésticas pesadas", DIFF),
        qd("q3", "Carregar uma sacola de compras ou pasta", DIFF),
        qd("q4", "Lavar as costas", DIFF),
        qd("q5", "Usar uma faca para cortar alimentos", DIFF),
        qd(
          "q6",
          "Atividades de lazer que exigem força ou impacto no braço",
          DIFF
        ),
      ],
    },
    {
      title: "Impacto e sintomas",
      questions: [
        qd("q7", "O problema atrapalhou suas atividades sociais?", [
          "De forma alguma",
          "Um pouco",
          "Moderadamente",
          "Muito",
          "Extremamente",
        ]),
        qd("q8", "Você ficou limitado no trabalho ou tarefas do dia a dia?", [
          "Não limitou",
          "Um pouco",
          "Moderadamente",
          "Muito",
          "Incapaz",
        ]),
        qd("q9", "Intensidade da dor no braço, ombro ou mão", SEV),
        qd("q10", "Formigamento (alfinetadas) no braço, ombro ou mão", SEV),
        qd("q11", "Dificuldade para dormir por causa da dor", [
          "Sem dificuldade",
          "Pouca",
          "Moderada",
          "Muita",
          "Não consegui dormir",
        ]),
      ],
    },
  ],
};

// ---------------------------------------------------------------------
// SPADI — 13 itens 0–10. Total = média das subescalas Dor (5) e Incapacidade
// (8), em %. Pesos por item: dor ×1.0; incapacidade ×0.625. Maior = pior.
// ---------------------------------------------------------------------
export const SPADI: ScoredDef = {
  key: "spadi",
  name: "SPADI — dor e função do ombro",
  intro: "Pensando na última semana, marque de 0 a 10 em cada item.",
  maxScore: 100,
  sections: [
    {
      title: "Dor",
      subtitle: "Qual a intensidade da dor no ombro ao… (0 = nenhuma · 10 = a pior possível)",
      questions: [
        nrs("d1", "No pior momento", 1),
        nrs("d2", "Ao deitar sobre o lado afetado", 1),
        nrs("d3", "Ao pegar algo numa prateleira alta", 1),
        nrs("d4", "Ao tocar a nuca", 1),
        nrs("d5", "Ao empurrar com o braço afetado", 1),
      ],
    },
    {
      title: "Incapacidade",
      subtitle: "Qual a dificuldade para… (0 = nenhuma · 10 = preciso de ajuda)",
      questions: [
        nrs("i1", "Lavar o cabelo", 0.625),
        nrs("i2", "Lavar as costas", 0.625),
        nrs("i3", "Vestir uma camiseta (pela cabeça)", 0.625),
        nrs("i4", "Vestir uma camisa abotoada", 0.625),
        nrs("i5", "Vestir a calça", 0.625),
        nrs("i6", "Colocar um objeto numa prateleira alta", 0.625),
        nrs("i7", "Carregar um objeto pesado (~5 kg)", 0.625),
        nrs("i8", "Retirar algo do bolso de trás", 0.625),
      ],
    },
  ],
};

// ---------------------------------------------------------------------
// PRTEE — 15 itens 0–10. Dor (5, ×1.0 → 0–50) + Função (10, ×0.5 → 0–50).
// Total 0–100. Maior = pior.
// ---------------------------------------------------------------------
export const PRTEE: ScoredDef = {
  key: "prtee",
  name: "PRTEE — cotovelo (epicondilite)",
  intro: "Pensando na última semana, marque de 0 a 10 em cada item.",
  maxScore: 100,
  sections: [
    {
      title: "Dor",
      subtitle: "Qual a intensidade da dor no cotovelo… (0 = nenhuma · 10 = a pior)",
      questions: [
        nrs("p1", "Em repouso", 1),
        nrs("p2", "Ao fazer um movimento repetido com o braço", 1),
        nrs("p3", "Ao carregar uma sacola de compras", 1),
        nrs("p4", "No pior momento", 1),
        nrs("p5", "Quando estava em atividade", 1),
      ],
    },
    {
      title: "Função",
      subtitle: "Qual a dificuldade para… (0 = nenhuma · 10 = incapaz)",
      questions: [
        nrs("f1", "Girar uma maçaneta", 0.5),
        nrs("f2", "Carregar uma sacola de compras", 0.5),
        nrs("f3", "Levantar um copo cheio", 0.5),
        nrs("f4", "Abrir um pote", 0.5),
        nrs("f5", "Apoiar-se sobre a mão", 0.5),
        nrs("u1", "Atividades pessoais (vestir-se, higiene)", 0.5),
        nrs("u2", "Tarefas domésticas", 0.5),
        nrs("u3", "Trabalho", 0.5),
        nrs("u4", "Atividades recreativas ou esporte", 0.5),
        nrs("u5", "Atividades habituais em geral", 0.5),
      ],
    },
  ],
};

// ---------------------------------------------------------------------
// VISA-P / VISA-A — tendinopatia patelar / do Aquiles. 0–100, MAIOR = MELHOR.
// Q1–Q7 cada 0–10 (10 = melhor). Q8 = participação esportiva (0–30).
// ⚠️ Q8 simplificada — revisar.
// ---------------------------------------------------------------------
const VISA_Q8: ScoredQuestion = {
  id: "q8",
  label: "Sobre praticar esporte ou atividade física na sua situação atual:",
  options: [
    { label: "Não pratico nada por causa da dor", value: 0 },
    { label: "Pratico, mas a dor me impede de treinar/competir", value: 10 },
    { label: "Treino, mas com dor que limita", value: 14 },
    { label: "Treino/compito com dor mínima", value: 21 },
    { label: "Treino/compito normalmente, sem dor", value: 30 },
  ],
};

export const VISA_P: ScoredDef = {
  key: "visa_p",
  name: "VISA-P — tendinopatia patelar (joelho)",
  intro:
    "Pensando na última semana. Em cada item de 0 a 10, 10 é o melhor (sem dor / sem limitação).",
  maxScore: 100,
  sections: [
    {
      title: "Sintomas e função",
      subtitle: "0 = pior · 10 = melhor",
      questions: [
        nrs("q1", "Por quanto tempo consegue ficar sentado sem dor no joelho?"),
        nrs("q2", "Você tem dor ao descer escadas?"),
        nrs("q3", "Você tem dor ao estender o joelho com força?"),
        nrs("q4", "Você tem dor ao agachar completamente?"),
        nrs("q5", "Você tem dor ao pular ou saltar?"),
        nrs("q6", "Por quanto tempo consegue praticar atividade sem dor?"),
        nrs("q7", "Dor durante ou logo após a atividade física"),
      ],
    },
    { title: "Esporte", questions: [VISA_Q8] },
  ],
};

export const VISA_A: ScoredDef = {
  key: "visa_a",
  name: "VISA-A — tendinopatia do Aquiles (tornozelo)",
  intro:
    "Pensando na última semana. Em cada item de 0 a 10, 10 é o melhor (sem dor / sem limitação).",
  maxScore: 100,
  sections: [
    {
      title: "Sintomas e função",
      subtitle: "0 = pior · 10 = melhor",
      questions: [
        nrs("q1", "Ao acordar, por quanto tempo NÃO tem rigidez no tendão?"),
        nrs("q2", "Você tem dor ao alongar o tendão de Aquiles?"),
        nrs("q3", "Você tem dor ao descer escadas?"),
        nrs("q4", "Você tem dor ao ficar na ponta dos pés (elevar o calcanhar)?"),
        nrs("q5", "Você tem dor ao pular?"),
        nrs("q6", "Por quanto tempo consegue praticar atividade sem dor?"),
        nrs("q7", "Dor durante ou logo após a atividade física"),
      ],
    },
    { title: "Esporte", questions: [VISA_Q8] },
  ],
};

// ---------------------------------------------------------------------
// Dedo em gatilho — classificação de Quinnell (grau 0–IV). Maior = pior.
// ---------------------------------------------------------------------
export const QUINNELL: ScoredDef = {
  key: "quinnell",
  name: "Dedo em gatilho — classificação (Quinnell)",
  intro: "Escolha o grau que melhor descreve o dedo afetado.",
  maxScore: 4,
  sections: [
    {
      title: "Grau do dedo em gatilho",
      questions: [
        {
          id: "grade",
          label: "",
          options: [
            { label: "0 — Movimento normal", value: 0 },
            { label: "I — Movimento irregular do dedo", value: 1 },
            {
              label:
                "II — Travamento/estalido que o paciente corrige sozinho (ativamente)",
              value: 2,
            },
            {
              label:
                "III — Travamento que só corrige com a outra mão (passivamente)",
              value: 3,
            },
            { label: "IV — Dedo fixo, não corrige", value: 4 },
          ],
        },
      ],
    },
  ],
};

/** Registro dos questionários pontuados de tendinite. */
export const TENDINITE_SCORED: Record<string, ScoredDef> = {
  quickdash: QUICKDASH,
  spadi: SPADI,
  prtee: PRTEE,
  visa_p: VISA_P,
  visa_a: VISA_A,
  quinnell: QUINNELL,
};
