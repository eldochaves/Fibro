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

/**
 * Há uma solicitação do médico ainda não atendida? (reabre o questionário,
 * inclusive os "apenas uma vez"). Verdadeiro quando a solicitação é mais
 * recente que a última resposta.
 */
export function hasOpenRequest(
  requestedISO: string | null | undefined,
  lastISO: string | null | undefined
): boolean {
  if (!requestedISO) return false;
  if (!lastISO) return true;
  return Date.parse(requestedISO) > Date.parse(lastISO);
}

export function isAvailableNow(
  freq: Frequency,
  lastISO: string | null | undefined,
  requestedISO?: string | null
): boolean {
  if (hasOpenRequest(requestedISO, lastISO)) return true;
  return nextAvailable(freq, lastISO) === null;
}

/**
 * Momento (ms) em que a pendência atual começou, ou null se não há pendência.
 *  - solicitação do médico em aberto → data da solicitação
 *  - nunca respondido → 0 (desde sempre)
 *  - recorrente reaberto → data da reabertura
 */
export function pendingSince(
  freq: Frequency,
  lastISO: string | null | undefined,
  requestedISO?: string | null
): number | null {
  if (hasOpenRequest(requestedISO, lastISO)) return Date.parse(requestedISO!);
  if (!lastISO) return 0;
  if (freq === "yearly" || freq === "quarterly4") {
    const na = nextAvailable(freq, lastISO);
    if (na === null) {
      const d = new Date(lastISO);
      if (freq === "yearly") d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 4);
      return d.getTime();
    }
  }
  return null;
}

/**
 * Pendência ("questionário em aberto"), considerando dispensa do médico.
 * Se a dispensa for igual/posterior ao início da pendência, ela é silenciada.
 */
export function isPending(
  freq: Frequency,
  lastISO: string | null | undefined,
  requestedISO?: string | null,
  dismissedISO?: string | null
): boolean {
  const since = pendingSince(freq, lastISO, requestedISO);
  if (since === null) return false;
  if (dismissedISO && Date.parse(dismissedISO) >= since) return false;
  return true;
}
