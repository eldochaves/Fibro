/**
 * Critérios diagnósticos de Fibromialgia — ACR 2016
 * (American College of Rheumatology, revisão de 2016)
 *
 * O diagnóstico é baseado em:
 *  - WPI (Widespread Pain Index / Índice de Dor Generalizada): 0–19
 *  - SSS (Symptom Severity Scale / Escala de Severidade dos Sintomas): 0–12
 *
 * Os critérios são satisfeitos quando TODAS as condições abaixo são verdadeiras:
 *  1. (WPI >= 7 e SSS >= 5) OU (WPI entre 4 e 6 e SSS >= 9)
 *  2. Dor generalizada presente em pelo menos 4 das 5 regiões corporais
 *     (regiões axiais não contam para o critério de "generalizada")
 *  3. Sintomas presentes em nível semelhante por pelo menos 3 meses
 */

// ---------------------------------------------------------------------------
// WPI — 19 áreas corporais agrupadas em 5 regiões
// ---------------------------------------------------------------------------

export type Region =
  | "superior_esquerda"
  | "superior_direita"
  | "inferior_esquerda"
  | "inferior_direita"
  | "axial";

export interface BodyArea {
  id: string;
  label: string;
  region: Region;
}

export const BODY_AREAS: BodyArea[] = [
  // Região superior esquerda
  { id: "mandibula_esq", label: "Mandíbula esquerda", region: "superior_esquerda" },
  { id: "ombro_esq", label: "Cintura escapular esquerda (ombro)", region: "superior_esquerda" },
  { id: "braco_sup_esq", label: "Braço esquerdo (parte superior)", region: "superior_esquerda" },
  { id: "braco_inf_esq", label: "Antebraço esquerdo", region: "superior_esquerda" },

  // Região superior direita
  { id: "mandibula_dir", label: "Mandíbula direita", region: "superior_direita" },
  { id: "ombro_dir", label: "Cintura escapular direita (ombro)", region: "superior_direita" },
  { id: "braco_sup_dir", label: "Braço direito (parte superior)", region: "superior_direita" },
  { id: "braco_inf_dir", label: "Antebraço direito", region: "superior_direita" },

  // Região inferior esquerda
  { id: "quadril_esq", label: "Quadril/nádega esquerda", region: "inferior_esquerda" },
  { id: "coxa_esq", label: "Coxa esquerda", region: "inferior_esquerda" },
  { id: "perna_esq", label: "Perna esquerda (panturrilha)", region: "inferior_esquerda" },

  // Região inferior direita
  { id: "quadril_dir", label: "Quadril/nádega direita", region: "inferior_direita" },
  { id: "coxa_dir", label: "Coxa direita", region: "inferior_direita" },
  { id: "perna_dir", label: "Perna direita (panturrilha)", region: "inferior_direita" },

  // Região axial
  { id: "pescoco", label: "Pescoço", region: "axial" },
  { id: "torax", label: "Tórax (peito)", region: "axial" },
  { id: "abdome", label: "Abdome", region: "axial" },
  { id: "costas_sup", label: "Costas (parte superior)", region: "axial" },
  { id: "costas_inf", label: "Costas (parte inferior / lombar)", region: "axial" },
];

export const REGION_LABELS: Record<Region, string> = {
  superior_esquerda: "Superior esquerda",
  superior_direita: "Superior direita",
  inferior_esquerda: "Inferior esquerda",
  inferior_direita: "Inferior direita",
  axial: "Axial",
};

// Regiões que contam para o critério de "dor generalizada" (4 de 5)
export const GENERALIZED_REGIONS: Region[] = [
  "superior_esquerda",
  "superior_direita",
  "inferior_esquerda",
  "inferior_direita",
  "axial",
];

// ---------------------------------------------------------------------------
// SSS — Escala de Severidade dos Sintomas
// ---------------------------------------------------------------------------

// Três sintomas avaliados de 0 (sem problema) a 3 (grave)
export interface SssSeverityItem {
  id: "fadiga" | "sono" | "cognitivo";
  label: string;
  description: string;
}

export const SSS_SEVERITY_ITEMS: SssSeverityItem[] = [
  {
    id: "fadiga",
    label: "Fadiga (cansaço)",
    description: "Nível de cansaço ao longo da última semana.",
  },
  {
    id: "sono",
    label: "Acordar cansado(a)",
    description: "Acordar sem se sentir descansado(a), sono não reparador.",
  },
  {
    id: "cognitivo",
    label: "Sintomas cognitivos",
    description: "Dificuldade de concentração, memória, raciocínio (\"névoa mental\").",
  },
];

export const SSS_SEVERITY_OPTIONS = [
  { value: 0, label: "0 — Nenhum problema" },
  { value: 1, label: "1 — Leve / ocasional" },
  { value: 2, label: "2 — Moderado / frequente" },
  { value: 3, label: "3 — Grave / contínuo" },
];

// Três sintomas adicionais (presença nos últimos 6 meses), cada um vale 0 ou 1
export interface SssSymptomItem {
  id: "dor_cabeca" | "dor_abdome" | "depressao";
  label: string;
}

export const SSS_SYMPTOM_ITEMS: SssSymptomItem[] = [
  { id: "dor_cabeca", label: "Dores de cabeça" },
  { id: "dor_abdome", label: "Dor ou cólicas na parte baixa do abdome" },
  { id: "depressao", label: "Depressão / tristeza profunda" },
];

// ---------------------------------------------------------------------------
// Estrutura das respostas e cálculo
// ---------------------------------------------------------------------------

export interface FibroAnswers {
  // WPI: ids das áreas com dor na última semana
  painAreas: string[];
  // SSS severidade (0–3 cada)
  severity: {
    fadiga: number;
    sono: number;
    cognitivo: number;
  };
  // SSS sintomas (true/false)
  symptoms: {
    dor_cabeca: boolean;
    dor_abdome: boolean;
    depressao: boolean;
  };
  // Sintomas presentes há pelo menos 3 meses
  threeMonths: boolean;
}

export interface FibroResult {
  wpi: number;
  sss: number;
  regionsWithPain: number; // entre as 5 regiões generalizadas
  meetsCriteria: boolean;
  // Detalhes de cada condição (para exibir ao paciente/médico)
  conditions: {
    painThreshold: boolean; // (WPI>=7 & SSS>=5) | (WPI 4-6 & SSS>=9)
    generalizedPain: boolean; // >= 4 de 5 regiões
    duration: boolean; // >= 3 meses
  };
}

export function computeWpi(painAreas: string[]): number {
  const valid = new Set(BODY_AREAS.map((a) => a.id));
  return painAreas.filter((id) => valid.has(id)).length;
}

export function computeSss(answers: FibroAnswers): number {
  const sev =
    clamp03(answers.severity.fadiga) +
    clamp03(answers.severity.sono) +
    clamp03(answers.severity.cognitivo);
  const sym =
    (answers.symptoms.dor_cabeca ? 1 : 0) +
    (answers.symptoms.dor_abdome ? 1 : 0) +
    (answers.symptoms.depressao ? 1 : 0);
  return sev + sym; // 0–12
}

export function countRegionsWithPain(painAreas: string[]): number {
  const byArea = new Map(BODY_AREAS.map((a) => [a.id, a.region]));
  const regions = new Set<Region>();
  for (const id of painAreas) {
    const r = byArea.get(id);
    if (r) regions.add(r);
  }
  return GENERALIZED_REGIONS.filter((r) => regions.has(r)).length;
}

export function evaluate(answers: FibroAnswers): FibroResult {
  const wpi = computeWpi(answers.painAreas);
  const sss = computeSss(answers);
  const regionsWithPain = countRegionsWithPain(answers.painAreas);

  const painThreshold = (wpi >= 7 && sss >= 5) || (wpi >= 4 && wpi <= 6 && sss >= 9);
  const generalizedPain = regionsWithPain >= 4;
  const duration = answers.threeMonths === true;

  return {
    wpi,
    sss,
    regionsWithPain,
    meetsCriteria: painThreshold && generalizedPain && duration,
    conditions: { painThreshold, generalizedPain, duration },
  };
}

function clamp03(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(3, Math.round(n)));
}

// Classificação de severidade (FS — Fibromyalgia Severity Scale = WPI + SSS, 0–31)
export function fibromyalgiaSeverityScore(result: FibroResult): number {
  return result.wpi + result.sss;
}
