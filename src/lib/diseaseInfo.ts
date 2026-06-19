/**
 * Informações ao paciente sobre cada doença.
 *
 * Estratégia de CONFIABILIDADE: usamos um resumo curto em linguagem simples
 * (escrito de forma neutra, sem alarmar nem substituir o médico) + links
 * OFICIAIS de sociedades (principalmente a SBR — Sociedade Brasileira de
 * Reumatologia). Não buscamos/raspamos conteúdo externo em tempo real, para
 * evitar links quebrados e questões de direito autoral.
 *
 * Para revisar: o Dr. Eldo pode editar os resumos e trocar/adicionar links
 * por extenso aqui (ex.: cartilhas em PDF específicas que ele confie).
 */
export interface DiseaseResource {
  title: string;
  source: string;
  url: string;
}
export interface DiseaseInfo {
  summary: string;
  resources?: DiseaseResource[];
}

// Fontes gerais confiáveis, exibidas em todas as condições.
export const GENERAL_SOURCES: DiseaseResource[] = [
  {
    title: "Doenças reumáticas — informações para pacientes",
    source: "Sociedade Brasileira de Reumatologia (SBR)",
    url: "https://www.reumatologia.org.br/doencas-reumaticas/",
  },
  {
    title: "Orientações ao paciente",
    source: "Sociedade Brasileira de Reumatologia (SBR)",
    url: "https://www.reumatologia.org.br/orientacoes-ao-paciente/",
  },
];

export const DISEASE_INFO: Record<string, DiseaseInfo> = {
  fibromialgia: {
    summary:
      "A fibromialgia é uma condição de dor crônica espalhada pelo corpo, em geral acompanhada de cansaço, sono que não descansa e dificuldade de concentração. Ela não deforma as articulações e tem tratamento — que combina atividade física orientada, cuidado com o sono, manejo do estresse e, quando indicado, medicamentos. Pequenos hábitos no dia a dia fazem bastante diferença.",
    resources: [
      {
        title: "Fibromialgia — material para pacientes",
        source: "Sociedade Brasileira de Reumatologia (SBR)",
        url: "https://www.reumatologia.org.br/doencas-reumaticas/fibromialgia-e-doencas-articulares-inflamatorias/",
      },
    ],
  },
  lupus: {
    summary:
      "O lúpus é uma doença autoimune, em que o sistema de defesa do corpo ataca os próprios tecidos, podendo afetar pele, articulações e órgãos. Com acompanhamento e tratamento adequados, a maioria das pessoas leva uma vida ativa. Tomar a medicação conforme orientado e proteger-se do sol ajudam muito.",
  },
  gota: {
    summary:
      "A gota acontece pelo acúmulo de ácido úrico, que forma cristais nas articulações e provoca crises de dor intensa, muitas vezes no dedão do pé. Tem tratamento eficaz: remédios para as crises e para baixar o ácido úrico, além de cuidados com alimentação e boa hidratação.",
  },
  artrite_reumatoide: {
    summary:
      "A artrite reumatoide é uma doença inflamatória das articulações, de origem autoimune, que costuma causar dor, inchaço e rigidez — principalmente pela manhã. Começar o tratamento cedo ajuda a controlar a inflamação e a preservar o movimento das articulações.",
    resources: [
      {
        title: "Artrite Reumatoide — material para pacientes",
        source: "Sociedade Brasileira de Reumatologia (SBR)",
        url: "https://www.reumatologia.org.br/doencas-reumaticas/artrite-reumatoide/",
      },
    ],
  },
  osteoartrite: {
    summary:
      "A osteoartrite (também chamada de artrose) é o desgaste da cartilagem das articulações, comum com o passar dos anos, causando dor e rigidez — sobretudo em joelhos, quadris e mãos. Manter-se ativo, fortalecer a musculatura e cuidar do peso fazem parte importante do tratamento.",
    resources: [
      {
        title: "Osteoartrite (Artrose) — material para pacientes",
        source: "Sociedade Brasileira de Reumatologia (SBR)",
        url: "https://www.reumatologia.org.br/doencas-reumaticas/osteoartrite-artrose/",
      },
    ],
  },
  dor_cronica: {
    summary:
      "A dor crônica é a dor que persiste por mais de três meses. Ela envolve não só o local que dói, mas também o sono, o humor e o sistema nervoso. O tratamento costuma combinar atividade física, estratégias de manejo da dor e, quando necessário, medicamentos.",
  },
  dor_miofascial: {
    summary:
      "A síndrome dolorosa miofascial é uma dor que vem dos músculos, com pontos sensíveis (os pontos-gatilho) que às vezes irradiam para outras regiões. Costuma melhorar com alongamento, fisioterapia, correção da postura e cuidado com os fatores que tensionam a musculatura.",
  },
  bertolotti: {
    summary:
      "A síndrome de Bertolotti está relacionada a uma variação na última vértebra da coluna lombar que, em algumas pessoas, causa dor nas costas. O acompanhamento define o melhor tratamento, que costuma começar por fisioterapia, exercícios e controle da dor.",
  },
  tendinites: {
    summary:
      "As tendinites (ou tendinopatias) são a irritação ou o desgaste de um tendão — a estrutura que liga o músculo ao osso —, causando dor e, às vezes, perda de força no movimento. São comuns no ombro, cotovelo, punho, joelho e tornozelo. O tratamento costuma combinar repouso relativo, fisioterapia, fortalecimento progressivo e controle da dor.",
  },
};
