/**
 * Feedback do paciente após INFILTRAÇÃO PERIARTICULAR (tendinites).
 * Protocolo do Dr. Eldo: lidocaína + betametasona.
 *
 * Quando há mais de uma infiltração, é gerado UM feedback (uma resposta) por
 * LOCAL infiltrado — cada local é explicado em linguagem simples. Perguntas
 * por local: impressão de melhora (PGIC), dor atual, tempo até melhorar,
 * satisfação, conforto na aplicação e efeitos. Perguntas gerais (uma vez):
 * recomendaria, depoimento livre e autorização para compartilhar.
 */
export const PGIC_OPTIONS = [
  "Muito melhor",
  "Melhor",
  "Um pouco melhor",
  "Sem mudança",
  "Um pouco pior",
  "Pior",
  "Muito pior",
];
export const INICIO_OPTIONS = [
  "Não senti melhora",
  "Nas primeiras 24 horas",
  "Em poucos dias",
  "Em 1 a 2 semanas",
  "Depois de 2 semanas",
];
export const RECOMENDA_OPTIONS = ["Sim", "Talvez", "Não"];

/** Respostas de UM local infiltrado. */
export interface SiteAnswer {
  site: string; // chave do subtipo (ex.: manguito_rotador)
  pgic?: number;
  dor?: number; // 0–10
  inicio?: number;
  satisfacao?: number; // 0–10
  conforto?: number; // 0–10 (desconforto na aplicação)
  efeito?: boolean;
  efeito_desc?: string;
}

export interface InfiltracaoAnswers {
  perSite?: SiteAnswer[];
  // Gerais (uma vez)
  recomenda?: number;
  depoimento?: string;
  consent?: boolean;
  consent_nome?: boolean;
}

/** Completo: pelo menos um local, recomendação, e cada local com o essencial. */
export function isInfiltracaoComplete(a: InfiltracaoAnswers): boolean {
  const sites = a.perSite ?? [];
  if (sites.length === 0) return false;
  if (typeof a.recomenda !== "number") return false;
  return sites.every((s) =>
    [s.pgic, s.dor, s.inicio, s.satisfacao].every((v) => typeof v === "number")
  );
}

/** Resumo de UMA resposta (um local), guardado em questionnaire_responses. */
export function siteSummary(
  siteLabel: string,
  s: SiteAnswer,
  a: InfiltracaoAnswers
) {
  return {
    site: siteLabel,
    satisfacao: s.satisfacao ?? 0,
    dor: s.dor ?? 0,
    pgic: typeof s.pgic === "number" ? PGIC_OPTIONS[s.pgic] : null,
    inicio: typeof s.inicio === "number" ? INICIO_OPTIONS[s.inicio] : null,
    efeito: s.efeito === true,
    efeito_desc: s.efeito === true ? (s.efeito_desc ?? "").trim() : "",
    recomenda:
      typeof a.recomenda === "number" ? RECOMENDA_OPTIONS[a.recomenda] : null,
    consent: a.consent === true,
    consent_nome: a.consent_nome === true,
    depoimento: (a.depoimento ?? "").trim(),
  };
}
