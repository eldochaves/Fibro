/**
 * CSI — Central Sensitization Inventory (Inventário de Sensibilização Central)
 * Versão validada para o Brasil (Caumo et al., 2017).
 *
 * Parte A: 25 itens, cada um de 0 a 4 (Nunca…Sempre). Total 0–100.
 * Faixas de gravidade (Neblett et al., 2013):
 *   subclínico 0–29 · leve 30–39 · moderado 40–49 · grave 50–59 · extremo 60–100
 * Ponto de corte clássico para sensibilização central: ≥ 40.
 */

export const CSI_OPTIONS = [
  "Nunca",
  "Raramente",
  "Às vezes",
  "Frequentemente",
  "Sempre",
];

export const CSI_ITEMS: { id: string; label: string }[] = [
  { id: "c1", label: "Sinto-me sem energia ao acordar de manhã." },
  { id: "c2", label: "Sinto meus músculos rígidos e doloridos." },
  { id: "c3", label: "Tenho crises de ansiedade." },
  { id: "c4", label: "Range ou aperto os dentes." },
  { id: "c5", label: "Tenho problemas de diarreia e/ou prisão de ventre." },
  { id: "c6", label: "Preciso de ajuda para realizar minhas atividades diárias." },
  { id: "c7", label: "Sou sensível a luzes fortes." },
  { id: "c8", label: "Canso-me facilmente quando estou fisicamente ativo(a)." },
  { id: "c9", label: "Sinto dor no corpo todo." },
  { id: "c10", label: "Tenho dores de cabeça." },
  { id: "c11", label: "Sinto desconforto na bexiga e/ou ardência ao urinar." },
  { id: "c12", label: "Não durmo bem." },
  { id: "c13", label: "Tenho dificuldade de concentração." },
  { id: "c14", label: "Tenho problemas de pele, como ressecamento, coceira ou manchas." },
  { id: "c15", label: "O estresse faz meus sintomas físicos piorarem." },
  { id: "c16", label: "Sinto-me triste ou deprimido(a)." },
  { id: "c17", label: "Tenho pouca energia." },
  { id: "c18", label: "Tenho tensão muscular no pescoço e nos ombros." },
  { id: "c19", label: "Sinto dor na mandíbula." },
  { id: "c20", label: "Certos cheiros, como perfumes, me deixam tonto(a) e enjoado(a)." },
  { id: "c21", label: "Preciso urinar com frequência." },
  { id: "c22", label: "Minhas pernas ficam desconfortáveis e inquietas quando tento dormir à noite." },
  { id: "c23", label: "Tenho dificuldade para lembrar das coisas." },
  { id: "c24", label: "Sofri algum trauma na infância." },
  { id: "c25", label: "Sinto dor na região pélvica." },
];

export type CsiAnswers = Record<string, number>;

export interface CsiResult {
  total: number; // 0–100
  category: { label: string; tone: "good" | "mild" | "moderate" | "severe" };
}

export function isCsiComplete(a: CsiAnswers): boolean {
  return CSI_ITEMS.every((it) => typeof a[it.id] === "number");
}

export function computeCsi(a: CsiAnswers): CsiResult {
  const total = CSI_ITEMS.reduce((acc, it) => {
    const v = a[it.id];
    return acc + (typeof v === "number" ? Math.max(0, Math.min(4, v)) : 0);
  }, 0);
  return { total, category: categorizeCsi(total) };
}

export function categorizeCsi(total: number): CsiResult["category"] {
  if (total <= 29) return { label: "Subclínico", tone: "good" };
  if (total <= 39) return { label: "Leve", tone: "mild" };
  if (total <= 49) return { label: "Moderado", tone: "moderate" };
  if (total <= 59) return { label: "Grave", tone: "severe" };
  return { label: "Extremo", tone: "severe" };
}
