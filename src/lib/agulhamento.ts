/**
 * Pesquisa de satisfação após AGULHAMENTO SECO de pontos-gatilho
 * (dry needling) — Síndrome dolorosa miofascial.
 *
 * Reaproveita as escalas do feedback de infiltração e acrescenta a dor
 * muscular pós-sessão (comum no agulhamento). Campo de depoimento e
 * autorização para compartilhar, como no pós-infiltração.
 */
import { PGIC_OPTIONS, INICIO_OPTIONS, RECOMENDA_OPTIONS } from "@/lib/infiltracao";

export { PGIC_OPTIONS, INICIO_OPTIONS, RECOMENDA_OPTIONS };

export interface AgulhamentoAnswers {
  regiao?: string; // onde foi feito (texto livre, opcional)
  pgic?: number;
  inicio?: number;
  dor?: number; // 0–10 (dor atual)
  satisfacao?: number; // 0–10
  conforto?: number; // 0–10 (desconforto durante a sessão)
  pos_dor?: number; // 0–10 (dor muscular após a sessão)
  efeito?: boolean;
  efeito_desc?: string;
  recomenda?: number;
  depoimento?: string;
  consent?: boolean;
  consent_nome?: boolean;
}

export function isAgulhamentoComplete(a: AgulhamentoAnswers): boolean {
  if (typeof a.recomenda !== "number") return false;
  return [a.pgic, a.dor, a.inicio, a.satisfacao].every(
    (v) => typeof v === "number"
  );
}

export function agulhamentoSummary(a: AgulhamentoAnswers) {
  return {
    satisfacao: a.satisfacao ?? 0,
    dor: a.dor ?? 0,
    pos_dor: typeof a.pos_dor === "number" ? a.pos_dor : null,
    regiao: (a.regiao ?? "").trim(),
    pgic: typeof a.pgic === "number" ? PGIC_OPTIONS[a.pgic] : null,
    inicio: typeof a.inicio === "number" ? INICIO_OPTIONS[a.inicio] : null,
    efeito: a.efeito === true,
    efeito_desc: a.efeito === true ? (a.efeito_desc ?? "").trim() : "",
    recomenda:
      typeof a.recomenda === "number" ? RECOMENDA_OPTIONS[a.recomenda] : null,
    consent: a.consent === true,
    consent_nome: a.consent_nome === true,
    depoimento: (a.depoimento ?? "").trim(),
  };
}
