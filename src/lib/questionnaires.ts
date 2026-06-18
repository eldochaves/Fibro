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
  },
  {
    key: "eva",
    name: "Dor — Escala EVA (0–10)",
    short: "Dor · EVA",
    description: "Intensidade da dor de 0 (sem dor) a 10 (pior dor).",
    path: "/eva",
    icon: "📏",
    diseases: ["osteoartrite"],
    storage: "responses",
    indexLabel: "EVA",
    maxScore: 10,
  },
];

export const QUESTIONNAIRE_BY_KEY: Record<string, QuestionnaireDef> =
  Object.fromEntries(QUESTIONNAIRES.map((q) => [q.key, q]));

/** Questionários guardados em questionnaire_responses (genéricos). */
export const RESPONSE_QUESTIONNAIRES = QUESTIONNAIRES.filter(
  (q) => q.storage === "responses"
);
