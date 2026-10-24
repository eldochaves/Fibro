import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { BIO_DISEASES, DUT_SCREENING } from "@/lib/imunobiologicos";

export const dynamic = "force-dynamic";

export default async function ImunobiologicosPage() {
  const { user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Pacientes
        </Link>
        <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
          Imunobiológicos — guia de prescrição
        </h1>
        <p className="mb-5 mt-1 text-sm text-navy-500">
          Apoio rápido por doença: posologia, exigências da DUT e situação no
          PCDT/SUS.
        </p>

        {/* Aviso */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ <strong>Material de apoio.</strong> O PCDT e a DUT são atualizados
          periodicamente pelo Ministério da Saúde / Conitec. Confira sempre o
          protocolo vigente em{" "}
          <a
            href="https://www.gov.br/conitec/pt-br/assuntos/protocolos-clinicos"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline"
          >
            gov.br/conitec
          </a>{" "}
          antes de prescrever. Posologias seguem bula.
        </div>

        {/* Rastreamento pré-biológico (DUT) */}
        <div className="card mb-6 border-l-4 border-l-teal-500">
          <h2 className="font-display text-lg font-semibold text-navy-800">
            🧪 Rastreamento pré-biológico (DUT)
          </h2>
          <p className="mt-1 text-xs text-navy-400">
            Comum a todos os agentes — avaliar antes de iniciar.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-navy-700">
            {DUT_SCREENING.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-teal-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Por doença */}
        <div className="space-y-8">
          {BIO_DISEASES.map((d) => (
            <section key={d.key}>
              <h2 className="mb-2 border-l-4 border-navy-400 pl-2 font-display text-lg font-semibold text-navy-800">
                {d.label}
              </h2>

              <div className="card mb-3 space-y-2 text-sm">
                <p>
                  <span className="font-semibold text-navy-700">
                    Critérios / atividade:
                  </span>{" "}
                  <span className="text-navy-600">{d.inclusion}</span>
                </p>
                <p>
                  <span className="font-semibold text-navy-700">
                    Linha de tratamento:
                  </span>{" "}
                  <span className="text-navy-600">{d.line}</span>
                </p>
              </div>

              {/* Tabela de biológicos */}
              <div className="overflow-x-auto rounded-2xl border border-navy-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
                    <tr>
                      <th className="px-3 py-2">Medicamento</th>
                      <th className="px-3 py-2">Classe</th>
                      <th className="px-3 py-2">Posologia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.biologics.map((b) => (
                      <tr key={b.name} className="border-t border-navy-100 align-top">
                        <td className="px-3 py-2 font-semibold text-navy-800">
                          {b.name}
                        </td>
                        <td className="px-3 py-2 text-navy-500">{b.drugClass}</td>
                        <td className="px-3 py-2 text-navy-700">
                          {b.posology}
                          {b.note && (
                            <span className="mt-1 block text-xs text-amber-700">
                              {b.note}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-xs text-navy-400">
                {d.pcdt}{" "}
                <a
                  href={d.pcdtUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-teal-600 underline"
                >
                  Abrir no gov.br ↗
                </a>
              </p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
