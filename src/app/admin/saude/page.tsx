import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { DISEASES, DISEASE_LABEL } from "@/lib/questionnaires";
import {
  DISEASE_INFO,
  GENERAL_SOURCES,
  type DiseaseResource,
} from "@/lib/diseaseInfo";
import { diseaseTheme } from "@/lib/diseaseTheme";
import {
  DiseaseInfoEditor,
  type DiseaseInfoItem,
} from "./DiseaseInfoEditor";

export const dynamic = "force-dynamic";

export default async function AdminSaudePage() {
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const { data: rows } = await supabase
    .from("disease_info")
    .select("disease_key, summary, resources");
  const dbMap = new Map(
    (rows ?? []).map((r) => [
      r.disease_key as string,
      {
        summary: (r.summary as string) ?? "",
        resources: (r.resources as DiseaseResource[]) ?? [],
      },
    ])
  );

  // Inicial = o que está no banco; se não houver, usa o texto padrão do código.
  const items: DiseaseInfoItem[] = DISEASES.map((d) => {
    const db = dbMap.get(d.key);
    const def = DISEASE_INFO[d.key];
    return {
      key: d.key,
      label: DISEASE_LABEL[d.key],
      icon: diseaseTheme(d.key).icon,
      summary: db?.summary ?? def?.summary ?? "",
      resources: db?.resources ?? def?.resources ?? [],
    };
  });

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Pacientes
        </Link>
        <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
          Informações ao paciente
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Edite o resumo e os links de cada doença. O paciente vê isso em
          “Sobre minha saúde”, conforme as doenças marcadas na ficha dele. Os
          textos atuais são um ponto de partida — ajuste como preferir.
        </p>

        <DiseaseInfoEditor items={items} />

        <div className="card mt-6">
          <h2 className="text-sm font-semibold text-navy-700">
            Fontes gerais (fixas)
          </h2>
          <p className="mt-1 text-xs text-navy-400">
            Aparecem em todas as condições. Para alterá-las, fale comigo.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-navy-500">
            {GENERAL_SOURCES.map((r) => (
              <li key={r.url}>
                • {r.title} — {r.source}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
