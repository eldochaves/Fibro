/** Frequência de disponibilidade de um questionário para o paciente. */
export type Frequency =
  | "always"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "quarterly4"
  | "semiannual"
  | "yearly"
  | "once";

export const DEFAULT_FREQUENCY: Frequency = "always";

/** Incremento de cada frequência recorrente (dias ou meses). */
const INTERVAL: Record<Frequency, { days?: number; months?: number }> = {
  always: {},
  once: {},
  weekly: { days: 7 },
  biweekly: { days: 14 },
  monthly: { months: 1 },
  quarterly: { months: 3 },
  quarterly4: { months: 4 },
  semiannual: { months: 6 },
  yearly: { months: 12 },
};

export const FREQUENCY_OPTIONS: { key: Frequency; label: string }[] = [
  { key: "always", label: "Sempre disponível" },
  { key: "weekly", label: "Semanal" },
  { key: "biweekly", label: "Quinzenal" },
  { key: "monthly", label: "Mensal" },
  { key: "quarterly", label: "Trimestral (3 meses)" },
  { key: "quarterly4", label: "A cada 4 meses" },
  { key: "semiannual", label: "Semestral (6 meses)" },
  { key: "yearly", label: "Anual" },
  { key: "once", label: "Apenas uma vez" },
];

export const FREQUENCY_LABEL: Record<Frequency, string> = Object.fromEntries(
  FREQUENCY_OPTIONS.map((o) => [o.key, o.label])
) as Record<Frequency, string>;

const FREQUENCY_KEYS = new Set<string>(FREQUENCY_OPTIONS.map((o) => o.key));

export function normalizeFrequency(v: string | undefined | null): Frequency {
  return v && FREQUENCY_KEYS.has(v) ? (v as Frequency) : "always";
}

/** É uma frequência que se repete no tempo (não "always" nem "once")? */
function isRecurring(freq: Frequency): boolean {
  return freq !== "always" && freq !== "once";
}

/** Próxima data-limite a partir de uma data, conforme a frequência. */
function addInterval(from: Date, freq: Frequency): Date {
  const d = new Date(from);
  const spec = INTERVAL[freq];
  if (spec.days) d.setDate(d.getDate() + spec.days);
  if (spec.months) d.setMonth(d.getMonth() + spec.months);
  return d;
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

  const next = addInterval(new Date(lastISO), freq);
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
  if (isRecurring(freq)) {
    const next = addInterval(new Date(lastISO), freq);
    if (next.getTime() <= Date.now()) return next.getTime();
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
