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
  },
];

export const QUESTIONNAIRE_BY_KEY: Record<string, QuestionnaireDef> =
  Object.fromEntries(QUESTIONNAIRES.map((q) => [q.key, q]));
