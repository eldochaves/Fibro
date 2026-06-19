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
  { key: "dor_miofascial", label: "Síndrome dolorosa miofascial" },
  { key: "bertolotti", label: "Síndrome de Bertolotti" },
  { key: "tendinites", label: "Tendinites" },
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
    key: "odi",
    name: "Oswestry — Incapacidade lombar (ODI)",
    short: "Bertolotti · ODI",
    description: "Incapacidade funcional na dor lombar (0–100%; maior = pior).",
    path: "/q/odi",
    icon: "📋",
    diseases: ["bertolotti"],
    storage: "responses",
    indexLabel: "ODI",
    maxScore: 100,
    kind: "avaliacao",
  },
  {
    key: "startback",
    name: "STarT Back — risco de cronificação",
    short: "Bertolotti · STarT Back",
    description:
      "Triagem de risco (baixo/médio/alto) de incapacidade por dor lombar.",
    path: "/q/startback",
    icon: "🚦",
    diseases: ["bertolotti"],
    storage: "responses",
    indexLabel: "STarT",
    maxScore: 9,
    kind: "avaliacao",
  },
  {
    key: "bpi",
    name: "Inventário Breve de Dor (BPI)",
    short: "Dor · BPI",
    description:
      "Gravidade e interferência da dor no dia a dia (0–10; maior = pior).",
    path: "/bpi",
    icon: "📊",
    diseases: ["dor_miofascial"],
    storage: "responses",
    indexLabel: "BPI int.",
    maxScore: 10,
    kind: "avaliacao",
  },
  {
    key: "delphi_miofascial",
    name: "Ponto-gatilho miofascial — Delphi 2017",
    short: "Miofascial · Delphi 2017",
    description: "Critérios essenciais de ponto-gatilho (≥2 de 3 + dor regional).",
    path: "/q/delphi_miofascial",
    icon: "🩺",
    diseases: ["dor_miofascial"],
    storage: "responses",
    indexLabel: "Delphi",
    maxScore: 3,
    kind: "criterio",
    criterionType: "diagnostico",
  },
  {
    key: "quickdash",
    name: "Tendinite — QuickDASH (membro superior)",
    short: "Tendinites · QuickDASH",
    description: "Função do braço, ombro e mão (0–100; maior = pior).",
    path: "/q/quickdash",
    icon: "💪",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "QuickDASH",
    maxScore: 100,
    kind: "avaliacao",
  },
  {
    key: "spadi",
    name: "Tendinite — SPADI (ombro)",
    short: "Tendinites · SPADI",
    description: "Dor e função do ombro (0–100; maior = pior).",
    path: "/q/spadi",
    icon: "💪",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "SPADI",
    maxScore: 100,
    kind: "avaliacao",
    region: "manguito_rotador",
  },
  {
    key: "prtee",
    name: "Tendinite — PRTEE (cotovelo)",
    short: "Tendinites · PRTEE",
    description: "Dor e função no cotovelo/epicondilite (0–100; maior = pior).",
    path: "/q/prtee",
    icon: "💪",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "PRTEE",
    maxScore: 100,
    kind: "avaliacao",
    region: "epicondilite_lateral",
  },
  {
    key: "visa_p",
    name: "Tendinite — VISA-P (patelar)",
    short: "Tendinites · VISA-P",
    description: "Tendinopatia patelar do joelho (0–100; maior = melhor).",
    path: "/q/visa_p",
    icon: "🦵",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "VISA-P",
    maxScore: 100,
    kind: "avaliacao",
    higherIsBetter: true,
    region: "tend_patelar",
  },
  {
    key: "visa_a",
    name: "Tendinite — VISA-A (Aquiles)",
    short: "Tendinites · VISA-A",
    description: "Tendinopatia do tendão de Aquiles (0–100; maior = melhor).",
    path: "/q/visa_a",
    icon: "🦶",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "VISA-A",
    maxScore: 100,
    kind: "avaliacao",
    higherIsBetter: true,
    region: "tend_aquiles",
  },
  {
    key: "tend_finkelstein",
    name: "De Quervain — testes de exame",
    short: "Tendinites · De Quervain",
    description: "Apoio ao diagnóstico clínico (Finkelstein/Eichhoff).",
    path: "/q/tend_finkelstein",
    icon: "🩺",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Finkelstein",
    maxScore: 2,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "de_quervain",
  },
  {
    key: "tend_cozen",
    name: "Epicondilite lateral — testes de exame",
    short: "Tendinites · Epicondilite lateral",
    description: "Apoio ao diagnóstico clínico (Cozen/Mill/Maudsley).",
    path: "/q/tend_cozen",
    icon: "🩺",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Cozen",
    maxScore: 3,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "epicondilite_lateral",
  },
  {
    key: "tend_medial",
    name: "Epicondilite medial — testes de exame",
    short: "Tendinites · Epicondilite medial",
    description: "Apoio ao diagnóstico clínico (flexão/pronação resistidas).",
    path: "/q/tend_medial",
    icon: "🩺",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Epicond. medial",
    maxScore: 2,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "epicondilite_medial",
  },
  {
    key: "tend_manguito",
    name: "Manguito rotador — testes de exame",
    short: "Tendinites · Manguito rotador",
    description: "Apoio ao diagnóstico clínico (Jobe/Neer/Hawkins/Patte).",
    path: "/q/tend_manguito",
    icon: "🩺",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Testes ombro",
    maxScore: 4,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "manguito_rotador",
  },
  {
    key: "tend_calcaria",
    name: "Tendinite calcária — apoio diagnóstico",
    short: "Tendinites · Calcária",
    description: "Apoio à suspeita (calcificação em imagem + sinais clínicos).",
    path: "/q/tend_calcaria",
    icon: "🩺",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Calcária",
    maxScore: 3,
    kind: "criterio",
    criterionType: "diagnostico",
    region: "tend_calcaria",
  },
  {
    key: "infiltracao_tend",
    name: "Feedback pós-infiltração",
    short: "Tendinites · Pós-infiltração",
    description:
      "Retorno do paciente após a infiltração periarticular (resposta, satisfação e depoimento).",
    path: "/infiltracao",
    icon: "💉",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Satisfação",
    maxScore: 10,
    kind: "avaliacao",
    higherIsBetter: true,
  },
  {
    key: "quinnell",
    name: "Dedo em gatilho — classificação (Quinnell)",
    short: "Tendinites · Dedo em gatilho",
    description: "Grau do dedo em gatilho (0–IV; maior = pior).",
    path: "/q/quinnell",
    icon: "🖐️",
    diseases: ["tendinites"],
    storage: "responses",
    indexLabel: "Quinnell",
    maxScore: 4,
    kind: "avaliacao",
    region: "dedo_gatilho",
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
  // Tendinites (subtipos)
  manguito_rotador: "Manguito rotador (ombro)",
  epicondilite_lateral: "Epicondilite lateral",
  epicondilite_medial: "Epicondilite medial",
  de_quervain: "De Quervain (punho)",
  dedo_gatilho: "Dedo em gatilho",
  tend_calcaria: "Tendinite calcária (ombro)",
  tend_patelar: "Tendinopatia patelar (joelho)",
  tend_aquiles: "Tendinopatia do Aquiles",
};

export const REGION_ORDER = [
  "joelho",
  "joelho_quadril",
  "quadril",
  "maos",
  "manguito_rotador",
  "tend_calcaria",
  "epicondilite_lateral",
  "epicondilite_medial",
  "de_quervain",
  "dedo_gatilho",
  "tend_patelar",
  "tend_aquiles",
];

/** Explicação em linguagem simples de cada local (para o paciente entender). */
export const TENDINITE_DESC: Record<string, string> = {
  manguito_rotador:
    "Tendões do ombro que ajudam a levantar e girar o braço.",
  tend_calcaria:
    "Depósito de cálcio em um tendão do ombro, que causa dor.",
  epicondilite_lateral:
    "Tendões da parte de fora do cotovelo (conhecido como “cotovelo de tenista”).",
  epicondilite_medial:
    "Tendões da parte de dentro do cotovelo (conhecido como “cotovelo de golfista”).",
  de_quervain: "Tendões do lado do polegar, na altura do punho.",
  dedo_gatilho: "Tendão de um dedo da mão que trava ou estala ao dobrar.",
  tend_patelar: "Tendão logo abaixo da rótula, na frente do joelho.",
  tend_aquiles: "Tendão do calcanhar, atrás do tornozelo.",
};

/** Subtipos de tendinite (para marcar os locais infiltrados). */
export const TENDINITE_SUBTYPES = [
  "manguito_rotador",
  "tend_calcaria",
  "epicondilite_lateral",
  "epicondilite_medial",
  "de_quervain",
  "dedo_gatilho",
  "tend_patelar",
  "tend_aquiles",
].map((key) => ({ key, label: REGION_LABEL[key], desc: TENDINITE_DESC[key] }));

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
