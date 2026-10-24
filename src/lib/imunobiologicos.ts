/**
 * Guia de apoio à prescrição de IMUNOBIOLÓGICOS (reumatologia) — área do médico.
 *
 * ⚠️ IMPORTANTE: PCDT e DUT são atualizados periodicamente pelo Ministério da
 * Saúde / Conitec. Este guia é um APOIO e NÃO substitui a consulta ao protocolo
 * vigente. Posologias seguem bula; a disponibilidade e a linha de tratamento no
 * SUS seguem o PCDT/DUT em vigor. Conferir sempre em gov.br/conitec.
 *
 * Conteúdo editável aqui pelo próprio médico (código) — peça para atualizar
 * quando sair uma nova versão do PCDT.
 */

export interface Biologic {
  name: string;
  drugClass: string;
  posology: string;
  note?: string; // observação de SUS/linha, quando relevante
}

export interface BioDisease {
  key: string;
  label: string;
  inclusion: string; // critérios de inclusão / atividade (DUT)
  line: string; // sequência de tratamento
  biologics: Biologic[];
  pcdt: string; // referência do PCDT
  pcdtUrl: string;
}

/** Rastreamento pré-biológico comum (DUT) — antes de iniciar qualquer agente. */
export const DUT_SCREENING: string[] = [
  "Excluir infecção ativa.",
  "Tuberculose latente: PPD (≥ 5 mm) ou IGRA + radiografia de tórax; tratar ILTB antes/junto, se indicado.",
  "Sorologias: hepatite B (HBsAg, anti-HBc, anti-HBs), hepatite C (anti-HCV) e HIV.",
  "Laboratório: hemograma, AST/ALT, creatinina.",
  "Vacinação em dia; não usar vacinas de vírus vivo durante o tratamento.",
  "Avaliar insuficiência cardíaca (anti-TNF contraindicado na CF III/IV), doença desmielinizante, neoplasia recente e gestação.",
];

export const BIO_DISEASES: BioDisease[] = [
  {
    key: "ar",
    label: "Artrite Reumatoide (AR)",
    inclusion:
      "Doença ativa moderada a alta (CDAI/SDAI/DAS28) após falha de ≥ 2 esquemas de MMCD sintéticos otimizados — um deles incluindo metotrexato, salvo contraindicação.",
    line:
      "1ª etapa: MMCD sintéticos (metotrexato, leflunomida, sulfassalazina, hidroxicloroquina/cloroquina). 2ª etapa (biológico/alvo-específico) após falha.",
    biologics: [
      { name: "Adalimumabe", drugClass: "Anti-TNF", posology: "40 mg SC a cada 2 semanas" },
      { name: "Etanercepte", drugClass: "Anti-TNF", posology: "50 mg SC por semana" },
      { name: "Infliximabe", drugClass: "Anti-TNF", posology: "3 mg/kg IV (semanas 0, 2, 6; depois a cada 8 semanas) — associar MTX" },
      { name: "Golimumabe", drugClass: "Anti-TNF", posology: "50 mg SC por mês" },
      { name: "Certolizumabe pegol", drugClass: "Anti-TNF", posology: "400 mg SC (semanas 0, 2 e 4) → 200 mg a cada 2 semanas" },
      { name: "Abatacepte", drugClass: "Coestimulação (CTLA4-Ig)", posology: "125 mg SC por semana (ou IV conforme o peso)" },
      { name: "Tocilizumabe", drugClass: "Anti-IL-6R", posology: "8 mg/kg IV a cada 4 semanas (ou 162 mg SC semanal)" },
      { name: "Rituximabe", drugClass: "Anti-CD20", posology: "1000 mg IV (dias 1 e 15); repetir ciclos ~a cada 6 meses" },
      { name: "Tofacitinibe", drugClass: "Inibidor de JAK (alvo-específico)", posology: "5 mg VO 2×/dia", note: "Avaliar risco cardiovascular/tromboembólico (critérios de uso dos iJAK)." },
    ],
    pcdt:
      "PCDT da Artrite Reumatoide (Conitec/MS) — em atualização (Relatório de Recomendação nº 1.021, 2025).",
    pcdtUrl:
      "https://www.gov.br/conitec/pt-br/midias/relatorios/2026/relatorio-de-recomendacao-no-1-021-pcdt-da-artrite-reumatoide",
  },
  {
    key: "espondilo",
    label: "Espondiloartrite axial / Espondilite anquilosante",
    inclusion:
      "Critérios de Nova York modificados ou ASAS; doença ativa (BASDAI ≥ 4 ou ASDAS) apesar de ≥ 2 AINEs por ≥ 4 semanas. Imagem de sacroilíacas (radiografia e/ou RM).",
    line:
      "1ª etapa: AINEs (≥ 2, otimizados) + fisioterapia/exercícios. 2ª etapa: biológico após falha dos AINEs.",
    biologics: [
      { name: "Adalimumabe", drugClass: "Anti-TNF", posology: "40 mg SC a cada 2 semanas" },
      { name: "Etanercepte", drugClass: "Anti-TNF", posology: "50 mg SC por semana" },
      { name: "Infliximabe", drugClass: "Anti-TNF", posology: "5 mg/kg IV (semanas 0, 2, 6; depois a cada 6–8 semanas)" },
      { name: "Golimumabe", drugClass: "Anti-TNF", posology: "50 mg SC por mês" },
      { name: "Certolizumabe pegol", drugClass: "Anti-TNF", posology: "400 mg SC (semanas 0, 2 e 4) → 200 mg a cada 2 semanas" },
      { name: "Secuquinumabe", drugClass: "Anti-IL-17A", posology: "150 mg SC (ataque semanas 0–4, depois mensal)", note: "⚠️ Não incorporado no SUS como etapa biológica para EpA axial (Portaria SCTIE nº 37/2021) — disponível fora do SUS; conferir atualizações." },
    ],
    pcdt:
      "PCDT da Espondilite Anquilosante / Espondiloartrite axial — Portaria SAS/MS nº 25/2018 (com retificação em 2019).",
    pcdtUrl: "https://www.gov.br/conitec/pt-br/assuntos/protocolos-clinicos",
  },
];
