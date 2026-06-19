/**
 * Motor de critérios diagnósticos/classificatórios (checklists sim/não).
 * Regra: todos os pré-requisitos (gate) "sim" E nº de itens "sim" ≥ limiar.
 * Preenchido geralmente pelo médico (inclui achados de exame físico).
 */
export interface CritItem {
  id: string;
  label: string;
}
export interface CriterionDef {
  key: string;
  name: string;
  intro?: string;
  gate: CritItem[]; // pré-requisitos (todos precisam ser "sim")
  items: CritItem[]; // contam para o limiar
  threshold: number; // mínimo de "sim" entre os itens
  metLabel: string; // texto quando atende
  notMetLabel: string; // texto quando não atende
  note?: string;
}

export type CriteriaAnswers = Record<string, boolean>;

export function criteriaAllItems(def: CriterionDef): CritItem[] {
  return [...def.gate, ...def.items];
}

export function isCriteriaComplete(
  def: CriterionDef,
  a: CriteriaAnswers
): boolean {
  return criteriaAllItems(def).every((it) => typeof a[it.id] === "boolean");
}

export function computeCriteria(def: CriterionDef, a: CriteriaAnswers) {
  const gateOk = def.gate.every((it) => a[it.id] === true);
  const count = def.items.filter((it) => a[it.id] === true).length;
  const met = gateOk && count >= def.threshold;
  return { gateOk, count, met };
}

// ---------------------------------------------------------------------
// Definições
// ---------------------------------------------------------------------

const ACR_KNEE: CriterionDef = {
  key: "acr_joelho",
  name: "OA de Joelho — Critérios clínicos ACR (1986)",
  intro:
    "Critérios de classificação (Altman, 1986). Atende quando há dor no joelho e pelo menos 3 dos 6 itens.",
  gate: [
    { id: "g_dor", label: "Dor no joelho na maioria dos dias do último mês" },
  ],
  items: [
    { id: "i_idade", label: "Idade maior que 50 anos" },
    { id: "i_rigidez", label: "Rigidez matinal com duração menor que 30 minutos" },
    { id: "i_crepitacao", label: "Crepitação à movimentação ativa" },
    { id: "i_dor_ossea", label: "Dor óssea à palpação das margens do joelho" },
    { id: "i_aumento", label: "Aumento ósseo (alargamento) do joelho" },
    { id: "i_sem_calor", label: "Ausência de calor local palpável" },
  ],
  threshold: 3,
  metLabel: "Atende aos critérios ACR para OA de joelho",
  notMetLabel: "Não atende aos critérios ACR",
  note: "Sensibilidade ~95%, especificidade ~69% (critérios clínicos).",
};

const ACR_HANDS: CriterionDef = {
  key: "acr_maos",
  name: "OA de Mãos — Critérios clínicos ACR (1990)",
  intro:
    "Critérios de classificação (Altman, 1990). Atende quando há dor/rigidez nas mãos e pelo menos 3 dos 4 itens.",
  gate: [
    {
      id: "g_dor",
      label:
        "Dor, desconforto ou rigidez nas mãos na maioria dos dias do último mês",
    },
  ],
  items: [
    {
      id: "i_tecido10",
      label:
        "Aumento de tecido duro em ≥ 2 das 10 articulações selecionadas*",
    },
    {
      id: "i_ifd",
      label: "Aumento de tecido duro em ≥ 2 articulações interfalângicas distais",
    },
    { id: "i_mcf", label: "Menos de 3 articulações metacarpofalângicas edemaciadas" },
    {
      id: "i_deformidade",
      label: "Deformidade em ≥ 1 das 10 articulações selecionadas*",
    },
  ],
  threshold: 3,
  metLabel: "Atende aos critérios ACR para OA de mãos",
  notMetLabel: "Não atende aos critérios ACR",
  note:
    "*10 articulações: 2ª e 3ª IFD, 2ª e 3ª IFP e 1ª carpometacarpal (trapézio-metacarpal) de ambas as mãos. Sensibilidade ~92%, especificidade ~98%.",
};

const EULAR_KNEE: CriterionDef = {
  key: "eular_joelho",
  name: "OA de Joelho — Diagnóstico EULAR (2010)",
  intro:
    "Recomendações EULAR para diagnóstico. Em adultos ≥ 40 anos com dor habitual no joelho, quanto mais características presentes, maior a probabilidade de OA.",
  gate: [
    { id: "g_idade", label: "Idade igual ou maior que 40 anos" },
    { id: "g_dor", label: "Dor habitual (relacionada ao uso) no joelho" },
  ],
  items: [
    { id: "s_rigidez", label: "Rigidez matinal de curta duração (≤ 30 min)" },
    { id: "s_funcao", label: "Redução da função / limitação para atividades" },
    { id: "s_dor_persistente", label: "Dor persistente no joelho" },
    { id: "x_crepitacao", label: "Crepitação à movimentação" },
    { id: "x_restricao", label: "Restrição de movimento (amplitude reduzida)" },
    { id: "x_aumento", label: "Aumento ósseo à palpação" },
  ],
  threshold: 3,
  metLabel: "Alta probabilidade de OA de joelho (≥ 3 características)",
  notMetLabel: "Probabilidade baixa/intermediária — avaliar outras causas",
  note:
    "Não é um escore de corte rígido: a presença das 3 sintomas + 3 sinais permite o diagnóstico clínico sem necessidade de imagem.",
};

const DELPHI_MIOFASCIAL: CriterionDef = {
  key: "delphi_miofascial",
  name: "Ponto-gatilho miofascial — Critérios de consenso (Delphi 2017)",
  intro:
    "Critérios essenciais para identificar um ponto-gatilho miofascial (Fernández-de-las-Peñas & Dommerholt, 2018). Com queixa de dor muscular regional, são necessários ao menos 2 dos 3 achados.",
  gate: [
    {
      id: "g_dor",
      label: "Dor muscular regional (espontânea ou desencadeada pela atividade)",
    },
  ],
  items: [
    { id: "i_banda", label: "Banda muscular tensa palpável" },
    {
      id: "i_ponto",
      label: "Ponto hipersensível (nódulo doloroso) dentro da banda tensa",
    },
    {
      id: "i_referida",
      label:
        "Dor referida e/ou reprodução do sintoma do paciente à compressão do ponto",
    },
  ],
  threshold: 2,
  metLabel: "Compatível com ponto-gatilho miofascial",
  notMetLabel: "Não preenche os critérios essenciais de ponto-gatilho",
  note:
    "Consenso Delphi 2017: banda tensa, ponto hipersensível e dor referida/reconhecida. A confirmação clínica depende do exame por profissional experiente.",
};

const TEND_FINKELSTEIN: CriterionDef = {
  key: "tend_finkelstein",
  name: "De Quervain — testes de exame",
  intro:
    "Apoio ao diagnóstico clínico da tenossinovite de De Quervain. Com dor na borda radial do punho, um teste positivo reforça a suspeita.",
  gate: [
    { id: "g_dor", label: "Dor na borda radial do punho / base do polegar" },
  ],
  items: [
    {
      id: "finkelstein",
      label:
        "Teste de Finkelstein positivo (dor ao desviar o punho para o lado do dedo mínimo com o polegar flexionado)",
    },
    { id: "eichhoff", label: "Teste de Eichhoff positivo" },
  ],
  threshold: 1,
  metLabel: "Compatível com tenossinovite de De Quervain",
  notMetLabel: "Testes não sugestivos",
  note: "Apoio clínico; a confirmação depende do exame por profissional.",
};

const TEND_COZEN: CriterionDef = {
  key: "tend_cozen",
  name: "Epicondilite lateral — testes de exame",
  intro:
    "Apoio ao diagnóstico clínico da epicondilite lateral (cotovelo de tenista).",
  gate: [
    { id: "g_dor", label: "Dor no epicôndilo lateral (face externa do cotovelo)" },
  ],
  items: [
    { id: "cozen", label: "Teste de Cozen positivo (dor à extensão resistida do punho)" },
    { id: "mill", label: "Teste de Mill positivo" },
    { id: "maudsley", label: "Teste de Maudsley (dedo médio) positivo" },
  ],
  threshold: 1,
  metLabel: "Compatível com epicondilite lateral",
  notMetLabel: "Testes não sugestivos",
};

const TEND_MEDIAL: CriterionDef = {
  key: "tend_medial",
  name: "Epicondilite medial — testes de exame",
  intro:
    "Apoio ao diagnóstico clínico da epicondilite medial (cotovelo de golfista).",
  gate: [
    { id: "g_dor", label: "Dor no epicôndilo medial (face interna do cotovelo)" },
  ],
  items: [
    { id: "flexao", label: "Dor à flexão resistida do punho" },
    { id: "pronacao", label: "Dor à pronação resistida do antebraço" },
  ],
  threshold: 1,
  metLabel: "Compatível com epicondilite medial",
  notMetLabel: "Testes não sugestivos",
};

const TEND_MANGUITO: CriterionDef = {
  key: "tend_manguito",
  name: "Manguito rotador — testes de exame",
  intro:
    "Apoio ao diagnóstico clínico de tendinopatia/síndrome do impacto do manguito rotador. Quanto mais testes positivos, maior a suspeita.",
  gate: [
    { id: "g_dor", label: "Dor no ombro, sobretudo ao elevar o braço ou à noite" },
  ],
  items: [
    { id: "jobe", label: "Teste de Jobe (empty can) positivo" },
    { id: "neer", label: "Sinal de Neer positivo" },
    { id: "hawkins", label: "Teste de Hawkins-Kennedy positivo" },
    { id: "patte", label: "Teste de Patte (rotação externa resistida) positivo" },
  ],
  threshold: 1,
  metLabel: "Compatível com tendinopatia do manguito rotador",
  notMetLabel: "Testes não sugestivos",
};

const TEND_CALCARIA: CriterionDef = {
  key: "tend_calcaria",
  name: "Tendinite calcária — apoio diagnóstico",
  intro:
    "A tendinite calcária do ombro é confirmada por imagem. Este checklist apoia a suspeita clínica.",
  gate: [{ id: "g_dor", label: "Dor no ombro" }],
  items: [
    {
      id: "imagem",
      label:
        "Calcificação no tendão visível em exame de imagem (raio-X ou ultrassom)",
    },
    { id: "noturna", label: "Dor noturna ou ao deitar sobre o ombro" },
    { id: "impacto", label: "Dor/limitação ao elevar o braço (sinais de impacto)" },
  ],
  threshold: 1,
  metLabel: "Compatível com tendinite calcária (confirmar pela imagem)",
  notMetLabel: "Pouco sugestivo",
  note: "A calcificação no exame de imagem é o achado-chave.",
};

export const CRITERIA_DEFS: Record<string, CriterionDef> = {
  acr_joelho: ACR_KNEE,
  acr_maos: ACR_HANDS,
  eular_joelho: EULAR_KNEE,
  delphi_miofascial: DELPHI_MIOFASCIAL,
  tend_finkelstein: TEND_FINKELSTEIN,
  tend_cozen: TEND_COZEN,
  tend_medial: TEND_MEDIAL,
  tend_manguito: TEND_MANGUITO,
  tend_calcaria: TEND_CALCARIA,
};
