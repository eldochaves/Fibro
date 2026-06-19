/**
 * Feedback do paciente após INFILTRAÇÃO PERIARTICULAR (tendinites).
 * Protocolo do Dr. Eldo: lidocaína + betametasona.
 *
 * Coleta: impressão global de melhora (PGIC), dor atual, tempo até melhorar,
 * satisfação, conforto durante a aplicação, efeitos indesejados, se
 * recomendaria, um DEPOIMENTO em texto livre e a AUTORIZAÇÃO para que a
 * opinião seja compartilhada (anônima) com outros pacientes no futuro.
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

export interface InfiltracaoAnswers {
  pgic?: number; // índice em PGIC_OPTIONS
  dor?: number; // 0–10 (intensidade da dor agora)
  inicio?: number; // índice em INICIO_OPTIONS
  satisfacao?: number; // 0–10
  conforto?: number; // 0–10 (dor/desconforto durante a aplicação)
  efeito?: boolean; // teve efeito indesejado?
  efeito_desc?: string; // descrição do efeito (se houve)
  recomenda?: number; // índice em RECOMENDA_OPTIONS
  depoimento?: string; // texto livre
  sites?: string[]; // locais infiltrados (chaves de subtipo), confirmados pelo paciente
  consent?: boolean; // autoriza compartilhar (anônimo)
  consent_nome?: boolean; // autoriza usar o primeiro nome
}

/** Itens obrigatórios para enviar (texto e autorizações são opcionais). */
export function isInfiltracaoComplete(a: InfiltracaoAnswers): boolean {
  return [a.pgic, a.dor, a.inicio, a.satisfacao, a.recomenda].every(
    (v) => typeof v === "number"
  );
}

export function infiltracaoSummary(a: InfiltracaoAnswers) {
  return {
    satisfacao: a.satisfacao ?? 0,
    dor: a.dor ?? 0,
    efeito: a.efeito === true,
    efeito_desc: a.efeito === true ? (a.efeito_desc ?? "").trim() : "",
    pgic: typeof a.pgic === "number" ? PGIC_OPTIONS[a.pgic] : null,
    recomenda:
      typeof a.recomenda === "number" ? RECOMENDA_OPTIONS[a.recomenda] : null,
    inicio: typeof a.inicio === "number" ? INICIO_OPTIONS[a.inicio] : null,
    consent: a.consent === true,
    consent_nome: a.consent_nome === true,
    depoimento: (a.depoimento ?? "").trim(),
  };
}
