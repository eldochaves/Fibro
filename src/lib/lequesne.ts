/**
 * Índice Algofuncional de Lequesne — versões para joelho e quadril.
 * Cada um: Dor/desconforto + Distância máxima de marcha + Atividades da vida
 * diária. Total 0–24 (quanto maior, pior). Versão validada para o Brasil
 * (Marx et al., 2006).
 *
 * Categorias de acometimento (handicap):
 *   1–4 leve · 5–7 moderado · 8–10 grave · 11–13 muito grave · ≥14 extremo
 */
import type { ScoredDef, ScoredSection, ScoredCategory } from "@/lib/scored";
import { FIHOA } from "@/lib/fihoa";
import { AUSCAN } from "@/lib/auscan";
import { ODI } from "@/lib/odi";
import { STARTBACK } from "@/lib/startback";
import { TENDINITE_SCORED } from "@/lib/tendinites";

const CATEGORIES: ScoredCategory[] = [
  { max: 0, label: "Sem acometimento" },
  { max: 4, label: "Leve" },
  { max: 7, label: "Moderado" },
  { max: 10, label: "Grave" },
  { max: 13, label: "Muito grave" },
  { max: 24, label: "Extremamente grave" },
];

// Seção de dor — comum, com o item 5 variando entre joelho e quadril
function painSection(item5: { id: string; label: string }): ScoredSection {
  return {
    title: "Dor ou desconforto",
    questions: [
      {
        id: "dor_noite",
        label: "Durante o repouso noturno na cama",
        options: [
          { label: "Nenhuma ou sem importância", value: 0 },
          { label: "Apenas ao se mexer ou em certas posições", value: 1 },
          { label: "Mesmo sem se mexer (imóvel)", value: 2 },
        ],
      },
      {
        id: "rigidez_matinal",
        label: "Rigidez matinal ou dor ao levantar",
        options: [
          { label: "1 minuto ou menos", value: 0 },
          { label: "De 1 a 15 minutos", value: 1 },
          { label: "Mais de 15 minutos", value: 2 },
        ],
      },
      {
        id: "em_pe_30",
        label: "Ficar em pé por 30 minutos aumenta a dor?",
        options: [
          { label: "Não", value: 0 },
          { label: "Sim", value: 1 },
        ],
      },
      {
        id: "dor_caminhar",
        label: "Dor ao caminhar",
        options: [
          { label: "Nenhuma", value: 0 },
          { label: "Apenas após caminhar certa distância", value: 1 },
          { label: "Desde o início e aumentando ao caminhar", value: 2 },
        ],
      },
      {
        id: item5.id,
        label: item5.label,
        options: [
          { label: "Não", value: 0 },
          { label: "Sim", value: 1 },
        ],
      },
    ],
  };
}

const walkingSection: ScoredSection = {
  title: "Distância máxima de marcha",
  subtitle: "Mesmo que com dor.",
  questions: [
    {
      id: "distancia",
      label: "Qual a maior distância que você consegue caminhar?",
      options: [
        { label: "Ilimitada", value: 0 },
        { label: "Mais de 1 km, porém limitada", value: 1 },
        { label: "Cerca de 1 km (≈15 min)", value: 2 },
        { label: "500 a 900 m (≈8–15 min)", value: 3 },
        { label: "300 a 500 m", value: 4 },
        { label: "100 a 300 m", value: 5 },
        { label: "Menos de 100 m", value: 6 },
      ],
    },
    {
      id: "apoio",
      label: "Precisa de apoio para caminhar?",
      options: [
        { label: "Não", value: 0 },
        { label: "Uma bengala ou muleta", value: 1 },
        { label: "Duas bengalas ou muletas", value: 2 },
      ],
    },
  ],
};

// AVD — cada item: 0 / 0,5 / 1 / 1,5 / 2
function adl(id: string, label: string) {
  return {
    id,
    label,
    options: [
      { label: "Sem dificuldade", value: 0 },
      { label: "Pouca dificuldade", value: 0.5 },
      { label: "Dificuldade moderada", value: 1 },
      { label: "Muita dificuldade", value: 1.5 },
      { label: "Impossível", value: 2 },
    ],
  };
}

const kneeAdl: ScoredSection = {
  title: "Atividades da vida diária",
  subtitle: "Qual o grau de dificuldade para…",
  questions: [
    adl("k1", "Subir um lance de escada"),
    adl("k2", "Descer um lance de escada"),
    adl("k3", "Agachar-se ou ajoelhar-se"),
    adl("k4", "Caminhar em terreno irregular"),
  ],
};

const hipAdl: ScoredSection = {
  title: "Atividades da vida diária",
  subtitle: "Qual o grau de dificuldade para…",
  questions: [
    adl("h1", "Calçar meias curvando-se para frente"),
    adl("h2", "Apanhar um objeto do chão"),
    adl("h3", "Subir um lance de escada"),
    adl("h4", "Entrar e sair de um carro"),
  ],
};

export const LEQUESNE_KNEE: ScoredDef = {
  key: "lequesne_joelho",
  name: "Lequesne — Joelho",
  maxScore: 24,
  categories: CATEGORIES,
  sections: [
    painSection({
      id: "dor_levantar_sentado",
      label: "Sente dor ao levantar-se da cadeira sem usar os braços?",
    }),
    walkingSection,
    kneeAdl,
  ],
};

export const LEQUESNE_HIP: ScoredDef = {
  key: "lequesne_quadril",
  name: "Lequesne — Quadril",
  maxScore: 24,
  categories: CATEGORIES,
  sections: [
    painSection({
      id: "dor_sentado_2h",
      label: "Sente dor ou desconforto ao permanecer sentado por 2 horas?",
    }),
    walkingSection,
    hipAdl,
  ],
};

/** Registro central de questionários por escolhas pontuadas. */
export const SCORED_DEFS: Record<string, ScoredDef> = {
  lequesne_joelho: LEQUESNE_KNEE,
  lequesne_quadril: LEQUESNE_HIP,
  fihoa: FIHOA,
  auscan: AUSCAN,
  odi: ODI,
  startback: STARTBACK,
  ...TENDINITE_SCORED,
};
