/**
 * KOOS (joelho) e HOOS (quadril) — Knee/Hip injury and Osteoarthritis
 * Outcome Score. Cinco subescalas, escore normalizado 0–100 por subescala,
 * em que 100 = sem queixas (melhor) e 0 = queixas extremas (pior).
 *
 * ⚠️ Conferir os enunciados com a versão validada em português (PT-BR) antes
 * de usar na clínica — a redação aqui segue a estrutura oficial do
 * instrumento, mas a tradução validada pode ter pequenas diferenças.
 */
import type { LikertDef, LikertItem, LikertSubscale } from "@/lib/likert";

// Âncoras (índice 0..4)
const FREQ = ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"];
const SEV = ["Nenhuma", "Leve", "Moderada", "Intensa", "Extrema"];
const PAINFREQ = ["Nunca", "Mensalmente", "Semanalmente", "Diariamente", "Sempre"];
const ABLE = ["Sempre", "Frequentemente", "Às vezes", "Raramente", "Nunca"];
const LIFE = ["De forma alguma", "Levemente", "Moderadamente", "Severamente", "Totalmente"];
const TROUBLE = ["De forma alguma", "Levemente", "Moderadamente", "Severamente", "Extremamente"];
const AWARE = ["Nunca", "Mensalmente", "Semanalmente", "Diariamente", "Constantemente"];

function mk(id: string, label: string, options?: string[]): LikertItem {
  return options ? { id, label, options } : { id, label };
}

function sub(
  key: string,
  title: string,
  subtitle: string,
  items: LikertItem[]
): LikertSubscale {
  return { key, title, subtitle, items };
}

// ---------------------------------------------------------------------
// KOOS — Joelho
// ---------------------------------------------------------------------
export const KOOS: LikertDef = {
  key: "koos",
  name: "KOOS — Joelho",
  intro:
    "Pense no seu joelho na última semana ao responder. Em cada subescala, 100 significa nenhum sintoma e 0 sintomas extremos.",
  options: SEV,
  subscales: [
    sub("sintomas", "Sintomas e rigidez", "Pensando no seu joelho na última semana…", [
      mk("S1", "Seu joelho incha?", FREQ),
      mk("S2", "Você sente atrito, ouve estalos ou qualquer outro tipo de ruído quando movimenta o joelho?", FREQ),
      mk("S3", "Seu joelho trava ou fica preso ao se movimentar?", FREQ),
      mk("S4", "Você consegue esticar (estender) o joelho completamente?", ABLE),
      mk("S5", "Você consegue dobrar (flexionar) o joelho completamente?", ABLE),
      mk("S6", "Qual a intensidade da rigidez do joelho ao acordar de manhã?"),
      mk("S7", "Qual a intensidade da rigidez do joelho ao final do dia (após sentar, deitar ou descansar)?"),
    ]),
    sub("dor", "Dor", "Qual a intensidade da dor no joelho ao…", [
      mk("P1", "Com que frequência você sente dor no joelho?", PAINFREQ),
      mk("P2", "Girar ou torcer sobre o joelho"),
      mk("P3", "Esticar o joelho completamente"),
      mk("P4", "Dobrar o joelho completamente"),
      mk("P5", "Andar em superfície plana"),
      mk("P6", "Subir ou descer escadas"),
      mk("P7", "À noite, deitado na cama (atrapalhando o sono)"),
      mk("P8", "Sentado ou deitado"),
      mk("P9", "Ficar em pé"),
    ]),
    sub("avd", "Atividades da vida diária", "Qual o grau de dificuldade que você teve para…", [
      mk("A1", "Descer escadas"),
      mk("A2", "Subir escadas"),
      mk("A3", "Levantar-se da posição sentada"),
      mk("A4", "Ficar em pé"),
      mk("A5", "Abaixar-se para pegar algo no chão"),
      mk("A6", "Andar em superfície plana"),
      mk("A7", "Entrar e sair do carro"),
      mk("A8", "Fazer compras"),
      mk("A9", "Calçar meias"),
      mk("A10", "Levantar-se da cama"),
      mk("A11", "Tirar as meias"),
      mk("A12", "Virar-se na cama"),
      mk("A13", "Entrar e sair da banheira ou do chuveiro"),
      mk("A14", "Sentar-se"),
      mk("A15", "Sentar e levantar do vaso sanitário"),
      mk("A16", "Realizar tarefas domésticas pesadas"),
      mk("A17", "Realizar tarefas domésticas leves"),
    ]),
    sub("esporte", "Esporte e lazer", "Qual o grau de dificuldade para…", [
      mk("SP1", "Agachar-se"),
      mk("SP2", "Correr"),
      mk("SP3", "Pular ou saltar"),
      mk("SP4", "Girar ou torcer sobre o joelho afetado"),
      mk("SP5", "Ajoelhar-se"),
    ]),
    sub("qualidade", "Qualidade de vida", "Pensando no seu joelho…", [
      mk("Q1", "Com que frequência você percebe o problema no seu joelho?", AWARE),
      mk("Q2", "Você modificou seu estilo de vida para evitar atividades que possam prejudicar o joelho?", LIFE),
      mk("Q3", "O quanto você se incomoda pela falta de confiança no seu joelho?", TROUBLE),
      mk("Q4", "De modo geral, qual a dificuldade que você tem com o seu joelho?"),
    ]),
  ],
};

// ---------------------------------------------------------------------
// HOOS — Quadril
// ---------------------------------------------------------------------
export const HOOS: LikertDef = {
  key: "hoos",
  name: "HOOS — Quadril",
  intro:
    "Pense no seu quadril na última semana ao responder. Em cada subescala, 100 significa nenhum sintoma e 0 sintomas extremos.",
  options: SEV,
  subscales: [
    sub("sintomas", "Sintomas e rigidez", "Pensando no seu quadril na última semana…", [
      mk("S1", "Você sente atrito, ouve estalos ou qualquer outro tipo de ruído no quadril?", FREQ),
      mk("S2", "Qual a dificuldade para afastar bem as pernas (abrir)?"),
      mk("S3", "Qual a dificuldade para dar passos largos ao caminhar?"),
      mk("S4", "Qual a intensidade da rigidez do quadril ao acordar de manhã?"),
      mk("S5", "Qual a intensidade da rigidez do quadril ao final do dia (após sentar, deitar ou descansar)?"),
    ]),
    sub("dor", "Dor", "Qual a intensidade da dor no quadril ao…", [
      mk("P1", "Com que frequência você sente dor no quadril?", PAINFREQ),
      mk("P2", "Esticar (estender) o quadril completamente"),
      mk("P3", "Dobrar (flexionar) o quadril completamente"),
      mk("P4", "Andar em superfície plana"),
      mk("P5", "Subir ou descer escadas"),
      mk("P6", "À noite, deitado na cama (atrapalhando o sono)"),
      mk("P7", "Sentado ou deitado"),
      mk("P8", "Ficar em pé"),
      mk("P9", "Andar em superfície dura (asfalto, concreto)"),
      mk("P10", "Andar em superfície irregular"),
    ]),
    sub("avd", "Atividades da vida diária", "Qual o grau de dificuldade que você teve para…", [
      mk("A1", "Descer escadas"),
      mk("A2", "Subir escadas"),
      mk("A3", "Levantar-se da posição sentada"),
      mk("A4", "Ficar em pé"),
      mk("A5", "Abaixar-se para pegar algo no chão"),
      mk("A6", "Andar em superfície plana"),
      mk("A7", "Entrar e sair do carro"),
      mk("A8", "Fazer compras"),
      mk("A9", "Calçar meias"),
      mk("A10", "Levantar-se da cama"),
      mk("A11", "Tirar as meias"),
      mk("A12", "Virar-se na cama"),
      mk("A13", "Entrar e sair da banheira ou do chuveiro"),
      mk("A14", "Sentar-se"),
      mk("A15", "Sentar e levantar do vaso sanitário"),
      mk("A16", "Realizar tarefas domésticas pesadas"),
      mk("A17", "Realizar tarefas domésticas leves"),
    ]),
    sub("esporte", "Esporte e lazer", "Qual o grau de dificuldade para…", [
      mk("SP1", "Agachar-se"),
      mk("SP2", "Correr"),
      mk("SP3", "Girar ou torcer sobre a perna afetada"),
      mk("SP4", "Andar em superfície irregular"),
    ]),
    sub("qualidade", "Qualidade de vida", "Pensando no seu quadril…", [
      mk("Q1", "Com que frequência você percebe o problema no seu quadril?", AWARE),
      mk("Q2", "Você modificou seu estilo de vida para evitar atividades que possam prejudicar o quadril?", LIFE),
      mk("Q3", "O quanto você se incomoda pela falta de confiança no seu quadril?", TROUBLE),
      mk("Q4", "De modo geral, qual a dificuldade que você tem com o seu quadril?"),
    ]),
  ],
};

/** Registro central dos questionários Likert normalizados (0–100, maior=melhor). */
export const LIKERT_DEFS: Record<string, LikertDef> = {
  koos: KOOS,
  hoos: HOOS,
};
