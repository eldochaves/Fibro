/**
 * Identidade visual por doença: ícone + paleta de cor para diferenciar os
 * blocos de cada doença na área do médico (Acompanhamento e Respostas).
 *
 * As classes são escritas por extenso (literais) para que o Tailwind as
 * inclua no build — por isso este arquivo está no `content` do tailwind.config.
 */
export interface DiseaseTheme {
  icon: string;
  /** Bloco (Acompanhamento): borda + faixa lateral colorida + fundo suave. */
  container: string;
  /** Círculo do ícone no cabeçalho do bloco. */
  iconWrap: string;
  /** Cor do título da doença. */
  title: string;
  /** Selo com a contagem "x/y liberados". */
  countBadge: string;
  /** Chip da doença (seletor) quando ativo. */
  chipActive: string;
  /** Borda esquerda do cabeçalho de seção (Respostas). */
  accentBorder: string;
}

export const DISEASE_THEME: Record<string, DiseaseTheme> = {
  fibromialgia: {
    icon: "🦋",
    container:
      "rounded-2xl border border-violet-200 border-l-4 border-l-violet-500 bg-violet-50/40 p-4",
    iconWrap: "bg-violet-100 text-violet-700",
    title: "text-violet-900",
    countBadge: "bg-violet-100 text-violet-700",
    chipActive:
      "border-violet-500 bg-violet-100 text-violet-800 ring-1 ring-violet-400",
    accentBorder: "border-violet-500",
  },
  lupus: {
    icon: "🌸",
    container:
      "rounded-2xl border border-rose-200 border-l-4 border-l-rose-500 bg-rose-50/40 p-4",
    iconWrap: "bg-rose-100 text-rose-700",
    title: "text-rose-900",
    countBadge: "bg-rose-100 text-rose-700",
    chipActive:
      "border-rose-500 bg-rose-100 text-rose-800 ring-1 ring-rose-400",
    accentBorder: "border-rose-500",
  },
  gota: {
    icon: "🦶",
    container:
      "rounded-2xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/50 p-4",
    iconWrap: "bg-amber-100 text-amber-700",
    title: "text-amber-900",
    countBadge: "bg-amber-100 text-amber-700",
    chipActive:
      "border-amber-500 bg-amber-100 text-amber-800 ring-1 ring-amber-400",
    accentBorder: "border-amber-500",
  },
  artrite_reumatoide: {
    icon: "🤲",
    container:
      "rounded-2xl border border-sky-200 border-l-4 border-l-sky-500 bg-sky-50/40 p-4",
    iconWrap: "bg-sky-100 text-sky-700",
    title: "text-sky-900",
    countBadge: "bg-sky-100 text-sky-700",
    chipActive: "border-sky-500 bg-sky-100 text-sky-800 ring-1 ring-sky-400",
    accentBorder: "border-sky-500",
  },
  osteoartrite: {
    icon: "🦴",
    container:
      "rounded-2xl border border-indigo-200 border-l-4 border-l-indigo-500 bg-indigo-50/40 p-4",
    iconWrap: "bg-indigo-100 text-indigo-700",
    title: "text-indigo-900",
    countBadge: "bg-indigo-100 text-indigo-700",
    chipActive:
      "border-indigo-500 bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400",
    accentBorder: "border-indigo-500",
  },
  dor_cronica: {
    icon: "⚡",
    container:
      "rounded-2xl border border-fuchsia-200 border-l-4 border-l-fuchsia-500 bg-fuchsia-50/40 p-4",
    iconWrap: "bg-fuchsia-100 text-fuchsia-700",
    title: "text-fuchsia-900",
    countBadge: "bg-fuchsia-100 text-fuchsia-700",
    chipActive:
      "border-fuchsia-500 bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-400",
    accentBorder: "border-fuchsia-500",
  },
  dor_miofascial: {
    icon: "💪",
    container:
      "rounded-2xl border border-cyan-200 border-l-4 border-l-cyan-500 bg-cyan-50/50 p-4",
    iconWrap: "bg-cyan-100 text-cyan-700",
    title: "text-cyan-900",
    countBadge: "bg-cyan-100 text-cyan-700",
    chipActive:
      "border-cyan-500 bg-cyan-100 text-cyan-800 ring-1 ring-cyan-400",
    accentBorder: "border-cyan-500",
  },
  tendinites: {
    icon: "🎾",
    container:
      "rounded-2xl border border-purple-200 border-l-4 border-l-purple-500 bg-purple-50/40 p-4",
    iconWrap: "bg-purple-100 text-purple-700",
    title: "text-purple-900",
    countBadge: "bg-purple-100 text-purple-700",
    chipActive:
      "border-purple-500 bg-purple-100 text-purple-800 ring-1 ring-purple-400",
    accentBorder: "border-purple-500",
  },
  bertolotti: {
    icon: "🩻",
    container:
      "rounded-2xl border border-orange-200 border-l-4 border-l-orange-500 bg-orange-50/50 p-4",
    iconWrap: "bg-orange-100 text-orange-700",
    title: "text-orange-900",
    countBadge: "bg-orange-100 text-orange-700",
    chipActive:
      "border-orange-500 bg-orange-100 text-orange-800 ring-1 ring-orange-400",
    accentBorder: "border-orange-500",
  },
};

export const DEFAULT_DISEASE_THEME: DiseaseTheme = {
  icon: "🩺",
  container: "rounded-2xl border border-navy-200 bg-navy-50/40 p-4",
  iconWrap: "bg-navy-100 text-navy-600",
  title: "text-navy-800",
  countBadge: "bg-navy-100 text-navy-600",
  chipActive: "border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500",
  accentBorder: "border-navy-400",
};

export function diseaseTheme(key: string): DiseaseTheme {
  return DISEASE_THEME[key] ?? DEFAULT_DISEASE_THEME;
}
