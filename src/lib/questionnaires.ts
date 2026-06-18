/**
 * Catálogo de doenças e questionários da plataforma.
 *
 * As DOENÇAS são etiquetas que o médico atribui ao paciente (organização).
 * Os QUESTIONÁRIOS são atribuídos livremente pelo médico (controle de acesso).
 *
 * Para adicionar um novo questionário no futuro: crie a rota/fluxo dele e
 * registre uma entrada em QUESTIONNAIRES com a `path` correspondente.
 */

export interface DiseaseDef {
  key: string;
  label: string;
}

export const DISEASES: DiseaseDef[] = [
  { key: "fibromialgia", label: "Fibromialgia" },
  { key: "lupus", label: "Lúpus" },
  { key: "gota", label: "Gota" },
  { key: "artrite_reumatoide", label: "Artrite Reumatoide" },
  { key: "osteoartrite", label: "Osteoartrite" },
  { key: "dor_cronica", label: "Dor crônica" },
];

export const DISEASE_LABEL: Record<string, string> = Object.fromEntries(
  DISEASES.map((d) => [d.key, d.label])
);

export interface QuestionnaireDef {
  key: string;
  name: string;
  short: string;
  description: string;
  path: string;
  icon: string;
  /** Doenças para as quais este questionário costuma ser indicado (sugestão). */
  diseases: string[];
  /** Onde as respostas são guardadas. */
  storage: "assessments" | "responses";
  /** Rótulo curto do índice (chips na lista do médico). */
  indexLabel: string;
  /** Escore máximo (para o gráfico e exibição). */
  maxScore: number;
  /** Tipo: ferramenta de avaliação ou critério diagnóstico/classificatório. */
  kind: "avaliacao" | "criterio";
  /** Para critérios: se é diagnóstico ou classificatório. */
  criterionType?: "diagnostico" | "classificatorio";
  /** Quando true, MAIOR escore = MELHOR (ex.: KOOS/HOOS, 0–100). */
  higherIsBetter?: boolean;
  /** Região anatômica (para sub-agrupar dentro de uma doença, ex.: OA). */
  region?: string;
}

export const QUESTIONNAIRES: QuestionnaireDef[] = [
  {
    key: "acr2016",
    name: "Avaliação de Fibromialgia (ACR 2016)",
    short: "Fibromialgia · ACR 2016",
    description:
      "Índice de Dor Generalizada (WPI) + Escala de Severidade dos Sintomas (SSS).",
    path: "/questionario",
    icon: "📝",
    diseases: ["fibromialgia"],
    storage: "assessments",
    indexLabel: "FS",
    maxScore: 31,
    kind: "criterio",
    criterionType: "diagnostico",
  },
  {
    key: "fiqr",
    name: "Impacto da Fibromialgia (FIQR)",
    short: "Fibromialgia · FIQR",
    description:
      "Mede o impacto da fibromialgia no dia a dia (função, impacto global e sintomas).",
    path: "/fiqr",
    icon: "📈",
    diseases: ["fibromialgia"],
    storage: "responses",
    indexLabel: "FIQR",
    maxScore: 100,
    kind: "avaliacao",
  },
  {
    key: "csi",
    name: "Sensibilização Central (CSI)",
    short: "Fibromialgia · CSI",
    description:
      "Central Sensitization Inventory — sintomas de centralização/sensibilização da dor.",
    path: "/csi",
    icon: "🧠",
    diseases: ["fibromialgia"],
    storage: "responses",
    indexLabel: "CSI",
    maxScore: 100,
    kind: "avaliacao",
  },
  {
    key: "pcs",
    name: "Catastrofização da Dor (PCS)",
    short: "Fibromialgia · PCS",
    description:
      "Pain Catastrophizing Scale — ruminação, magnificação e desamparo diante da dor.",
    path: "/pcs",
    icon: "🌀",
    diseases: ["fibromialgia"],
    storage: "responses",
    indexLabel: "PCS",
    maxScore: 52,
    kind: "avaliacao",
  },
  {
    key: "womac",
    name: "Osteoartrite — WOMAC",
    short: "Osteoartrite · WOMAC",
    description:
      "Dor, rigidez e função física na osteoartrite de joelho e quadril.",
    path: "/womac",
    icon: "🦵",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "WOMAC",
    maxScore: 96,
    kind: "avaliacao",
    region: "joelho_quadril",
  },
  {
    key: "lequesne_joelho",
    name: "Lequesne — Joelho",
    short: "Osteoartrite · Lequesne joelho",
    description: "Índice algofuncional de Lequesne para o joelho (0–24).",
    path: "/q/lequesne_joelho",
    icon: "🦵",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "Lequesne joelho",
    maxScore: 24,
    kind: "avaliacao",
    region: "joelho",
  },
  {
    key: "lequesne_quadril",
    name: "Lequesne — Quadril",
    short: "Osteoartrite · Lequesne quadril",
    description: "Índice algofuncional de Lequesne para o quadril (0–24).",
    path: "/q/lequesne_quadril",
    icon: "🦴",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "Lequesne quadril",
    maxScore: 24,
    kind: "avaliacao",
    region: "quadril",
  },
  {
    key: "eva",
    name: "Dor — Escala EVA (0–10)",
    short: "Dor · EVA",
    description: "Intensidade da dor de 0 (sem dor) a 10 (pior dor).",
    path: "/eva",
    icon: "📏",
    diseases: [], // genérico: aplica-se a qualquer doença (sempre disponível)
    storage: "responses",
    indexLabel: "EVA",
    maxScore: 10,
    kind: "avaliacao",
  },
  {
    key: "koos",
    name: "Osteoartrite — KOOS (joelho)",
    short: "Osteoartrite · KOOS joelho",
    description:
      "Sintomas, dor, função, esporte/lazer e qualidade de vida no joelho (5 subescalas, 0–100; maior = melhor).",
    path: "/q/koos",
    icon: "🦵",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "KOOS",
    maxScore: 100,
    kind: "avaliacao",
    higherIsBetter: true,
    region: "joelho",
  },
  {
    key: "hoos",
    name: "Osteoartrite — HOOS (quadril)",
    short: "Osteoartrite · HOOS quadril",
    description:
      "Sintomas, dor, função, esporte/lazer e qualidade de vida no quadril (5 subescalas, 0–100; maior = melhor).",
    path: "/q/hoos",
    icon: "🦴",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "HOOS",
    maxScore: 100,
    kind: "avaliacao",
    higherIsBetter: true,
    region: "quadril",
  },
  {
    key: "auscan",
    name: "Osteoartrite — AUSCAN (mãos)",
    short: "Osteoartrite · AUSCAN mãos",
    description:
      "Dor, rigidez e função das mãos na osteoartrite (0–60; maior = pior).",
    path: "/q/auscan",
    icon: "✋",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "AUSCAN",
    maxScore: 60,
    kind: "avaliacao",
    region: "maos",
  },
  {
    key: "fihoa",
    name: "FIHOA — Função das mãos",
    short: "Osteoartrite · FIHOA (mãos)",
    description: "Índice funcional de Dreiser para osteoartrite de mãos (0–30).",
    path: "/q/fihoa",
    icon: "✋",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "FIHOA",
    maxScore: 30,
    kind: "avaliacao",
    region: "maos",
  },
  {
    key: "acr_joelho",
    name: "OA de Joelho — Critérios ACR (1986)",
    short: "OA joelho · ACR",
    description: "Critérios clínicos de classificação (dor + ≥3 de 6).",
    path: "/q/acr_joelho",
    icon: "🩺",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "ACR joelho",
    maxScore: 6,
    kind: "criterio",
    criterionType: "classificatorio",
    region: "joelho",
  },
  {
    key: "acr_maos",
    name: "OA de Mãos — Critérios ACR (1990)",
    short: "OA mãos · ACR",
    description: "Critérios clínicos de classificação (dor + ≥3 de 4).",
    path: "/q/acr_maos",
    icon: "🩺",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "ACR mãos",
    maxScore: 4,
    kind: "criterio",
    criterionType: "classificatorio",
    region: "maos",
  },
  {
    key: "eular_joelho",
    name: "OA de Joelho — EULAR (2010)",
    short: "OA joelho · EULAR",
    description: "Apoio ao diagnóstico clínico (≥40 anos; 3 sintomas + 3 sinais).",
    path: "/q/eular_joelho",
    icon: "🩺",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "EULAR joelho",
    maxScore: 6,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "joelho",
  },
];

/** Rótulos e ordem das regiões anatômicas (sub-agrupamento dentro da doença). */
export const REGION_LABEL: Record<string, string> = {
  joelho: "Joelho",
  joelho_quadril: "Joelho e quadril",
  quadril: "Quadril",
  maos: "Mãos",
};

export const REGION_ORDER = ["joelho", "joelho_quadril", "quadril", "maos"];

export const CRITERION_TYPE_LABEL: Record<string, string> = {
  diagnostico: "Critério diagnóstico",
  classificatorio: "Critério classificatório",
};

export const QUESTIONNAIRE_BY_KEY: Record<string, QuestionnaireDef> =
  Object.fromEntries(QUESTIONNAIRES.map((q) => [q.key, q]));

/** Questionários guardados em questionnaire_responses (genéricos). */
export const RESPONSE_QUESTIONNAIRES = QUESTIONNAIRES.filter(
  (q) => q.storage === "responses"
);
