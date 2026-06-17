/** Frequência de disponibilidade de um questionário para o paciente. */
export type Frequency = "always" | "yearly" | "quarterly4" | "once";

export const DEFAULT_FREQUENCY: Frequency = "always";

export const FREQUENCY_OPTIONS: { key: Frequency; label: string }[] = [
  { key: "always", label: "Sempre disponível" },
  { key: "yearly", label: "Uma vez ao ano" },
  { key: "quarterly4", label: "A cada 4 meses" },
  { key: "once", label: "Apenas uma vez" },
];

export const FREQUENCY_LABEL: Record<Frequency, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((o) => [o.key, o.label])
) as Record<Frequency, string>;

export function normalizeFrequency(v: string | undefined | null): Frequency {
  if (v === "yearly" || v === "quarterly4" || v === "once") return v;
  return "always";
}

/**
 * Data em que o questionário volta a ficar disponível, dada a frequência e a
 * data do último preenchimento. Retorna:
 *  - null  → disponível agora
 *  - Date  → disponível a partir dessa data
 *  - "never" → não disponível novamente (frequência "apenas uma vez")
 */
export function nextAvailable(
  freq: Frequency,
  lastISO: string | null | undefined
): null | Date | "never" {
  if (!lastISO) return null; // nunca preencheu → disponível
  if (freq === "always") return null;
  if (freq === "once") return "never";

  const last = new Date(lastISO);
  const next = new Date(last);
  if (freq === "yearly") next.setFullYear(next.getFullYear() + 1);
  else if (freq === "quarterly4") next.setMonth(next.getMonth() + 4);

  return next.getTime() <= Date.now() ? null : next;
}

export function isAvailableNow(
  freq: Frequency,
  lastISO: string | null | undefined
): boolean {
  return nextAvailable(freq, lastISO) === null;
}

/**
 * Pendência ("questionário em aberto"): há algo para o paciente responder.
 *  - nunca respondido → sempre pendente (inclui "apenas uma vez" e "sempre")
 *  - recorrente (anual / a cada 4 meses) que reabriu → pendente
 *  - "apenas uma vez" ou "sempre" já respondido → não pendente
 */
export function isPending(
  freq: Frequency,
  lastISO: string | null | undefined
): boolean {
  if (!lastISO) return true;
  if (freq === "yearly" || freq === "quarterly4")
    return nextAvailable(freq, lastISO) === null;
  return false;
}
