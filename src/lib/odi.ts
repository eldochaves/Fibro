/**
 * ODI — Oswestry Disability Index (Índice de Incapacidade de Oswestry).
 * 10 seções, cada uma de 0 a 5. O resultado é expresso em PORCENTAGEM:
 * (soma ÷ 50) × 100. Aqui cada nível vale (nível × 2), de modo que a soma
 * das 10 seções já é a porcentagem (0–100). Quanto MAIOR, pior.
 *
 * Faixas: 0–20 mínima · 21–40 moderada · 41–60 intensa · 61–80 muito grave
 *         · 81–100 incapacidade total.
 *
 * ⚠️ Conferir os enunciados com a versão validada em PT-BR (Vigatto, 2007)
 * antes do uso clínico.
 */
import type { ScoredDef, ScoredQuestion, ScoredCategory } from "@/lib/scored";

const CATEGORIES: ScoredCategory[] = [
  { max: 20, label: "Incapacidade mínima" },
  { max: 40, label: "Incapacidade moderada" },
  { max: 60, label: "Incapacidade intensa" },
  { max: 80, label: "Incapacidade muito grave" },
  { max: 100, label: "Incapacidade total (restrito ao leito)" },
];

/** Converte 6 enunciados (níveis 0–5) em opções valendo nível × 2. */
function q(id: string, labels: [string, string, string, string, string, string]): ScoredQuestion {
  return {
    id,
    label: "",
    options: labels.map((label, i) => ({ label, value: i * 2 })),
  };
}

export const ODI: ScoredDef = {
  key: "odi",
  name: "ODI — Incapacidade de Oswestry",
  intro:
    "Para cada seção, marque a frase que melhor descreve a sua situação hoje. O resultado é uma porcentagem de incapacidade (0–100%).",
  maxScore: 100,
  categories: CATEGORIES,
  sections: [
    {
      title: "1. Intensidade da dor",
      questions: [
        q("p1", [
          "Não tenho dor no momento",
          "A dor é muito leve no momento",
          "A dor é moderada no momento",
          "A dor é razoavelmente intensa no momento",
          "A dor é muito intensa no momento",
          "A dor é a pior imaginável no momento",
        ]),
      ],
    },
    {
      title: "2. Cuidados pessoais (lavar-se, vestir-se)",
      questions: [
        q("p2", [
          "Cuido de mim normalmente, sem causar dor",
          "Cuido de mim normalmente, mas isso causa dor",
          "Cuidar de mim é doloroso; faço devagar e com cuidado",
          "Preciso de alguma ajuda, mas faço a maior parte sozinho(a)",
          "Preciso de ajuda todos os dias na maioria das tarefas",
          "Não me visto, lavo-me com dificuldade e fico na cama",
        ]),
      ],
    },
    {
      title: "3. Levantar pesos",
      questions: [
        q("p3", [
          "Consigo levantar objetos pesados sem dor",
          "Consigo levantar objetos pesados, mas isso causa dor",
          "A dor impede de levantar pesos do chão, mas consigo se bem posicionados (ex.: sobre a mesa)",
          "A dor impede levantar pesos, mas consigo objetos leves a médios se bem posicionados",
          "Consigo levantar apenas objetos muito leves",
          "Não consigo levantar ou carregar nada",
        ]),
      ],
    },
    {
      title: "4. Caminhar",
      questions: [
        q("p4", [
          "A dor não me impede de caminhar qualquer distância",
          "A dor me impede de caminhar mais de 1,5 km",
          "A dor me impede de caminhar mais de 500 m",
          "A dor me impede de caminhar mais de 100 m",
          "Só consigo caminhar usando bengala ou muletas",
          "Fico na cama a maior parte do tempo e me arrasto até o banheiro",
        ]),
      ],
    },
    {
      title: "5. Sentar",
      questions: [
        q("p5", [
          "Consigo sentar em qualquer cadeira o tempo que quiser",
          "Só na minha cadeira preferida consigo sentar o tempo que quiser",
          "A dor me impede de ficar sentado(a) por mais de 1 hora",
          "A dor me impede de ficar sentado(a) por mais de 30 minutos",
          "A dor me impede de ficar sentado(a) por mais de 10 minutos",
          "A dor me impede de sentar",
        ]),
      ],
    },
    {
      title: "6. Ficar em pé",
      questions: [
        q("p6", [
          "Consigo ficar em pé o tempo que quiser, sem dor",
          "Consigo ficar em pé o tempo que quiser, mas isso causa dor",
          "A dor me impede de ficar em pé por mais de 1 hora",
          "A dor me impede de ficar em pé por mais de 30 minutos",
          "A dor me impede de ficar em pé por mais de 10 minutos",
          "A dor me impede de ficar em pé",
        ]),
      ],
    },
    {
      title: "7. Sono",
      questions: [
        q("p7", [
          "Meu sono nunca é perturbado pela dor",
          "Meu sono é ocasionalmente perturbado pela dor",
          "Por causa da dor, durmo menos de 6 horas",
          "Por causa da dor, durmo menos de 4 horas",
          "Por causa da dor, durmo menos de 2 horas",
          "A dor me impede totalmente de dormir",
        ]),
      ],
    },
    {
      title: "8. Vida sexual (se aplicável)",
      questions: [
        q("p8", [
          "Minha vida sexual é normal, sem causar dor",
          "Minha vida sexual é normal, mas causa alguma dor",
          "Minha vida sexual é quase normal, mas é muito dolorosa",
          "Minha vida sexual é muito limitada pela dor",
          "Minha vida sexual é quase ausente por causa da dor",
          "A dor impede qualquer vida sexual",
        ]),
      ],
    },
    {
      title: "9. Vida social",
      questions: [
        q("p9", [
          "Minha vida social é normal, sem dor",
          "Minha vida social é normal, mas aumenta a dor",
          "A dor afeta só atividades mais intensas (ex.: esporte)",
          "A dor limitou minha vida social; saio menos de casa",
          "A dor restringiu minha vida social ao meu lar",
          "Não tenho vida social por causa da dor",
        ]),
      ],
    },
    {
      title: "10. Viagens e locomoção",
      questions: [
        q("p10", [
          "Posso ir a qualquer lugar sem dor",
          "Posso ir a qualquer lugar, mas isso causa dor",
          "A dor é forte, mas consigo fazer trajetos de mais de 2 horas",
          "A dor me restringe a trajetos de menos de 1 hora",
          "A dor me restringe a trajetos curtos e necessários (< 30 min)",
          "A dor me impede de sair, exceto para tratamento",
        ]),
      ],
    },
  ],
};
