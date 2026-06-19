import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { DISEASE_LABEL } from "@/lib/questionnaires";
import {
  DISEASE_INFO,
  GENERAL_SOURCES,
  type DiseaseInfo,
  type DiseaseResource,
} from "@/lib/diseaseInfo";
import { diseaseTheme } from "@/lib/diseaseTheme";

export const dynamic = "force-dynamic";

export default async function SaudePage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const diseases = (profile?.diseases as string[]) ?? [];

  // Conteúdo editado pelo médico (banco) tem prioridade sobre o padrão do código.
  const { data: rows } = await supabase
    .from("disease_info")
    .select("disease_key, summary, resources");
  const dbMap = new Map(
    (rows ?? []).map((r) => [
      r.disease_key as string,
      {
        summary: (r.summary as string) ?? "",
        resources: (r.resources as DiseaseResource[]) ?? [],
      } as DiseaseInfo,
    ])
  );
  const infoFor = (key: string): DiseaseInfo | undefined =>
    dbMap.get(key) ?? DISEASE_INFO[key];

  const known = diseases.filter((d) => infoFor(d)?.summary);

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/inicio"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Início
        </Link>

        <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
          Entendendo minha saúde
        </h1>
        <p className="mt-1 text-base text-navy-500">
          Informações simples e confiáveis sobre a(s) sua(s) condição(ões),
          baseadas em sociedades médicas. Elas ajudam a entender — mas não
          substituem a orientação do Dr. Eldo Chaves. 🌿
        </p>

        {known.length === 0 ? (
          <div className="card mt-6 text-center text-navy-500">
            <div className="text-3xl">📚</div>
            <p className="mt-2">
              Assim que o seu médico registrar a sua condição, os materiais
              informativos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {known.map((d) => {
              const info = infoFor(d)!;
              const theme = diseaseTheme(d);
              return (
                <section key={d} className={theme.container}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${theme.iconWrap}`}
                    >
                      {theme.icon}
                    </span>
                    <h2
                      className={`font-display text-lg font-semibold ${theme.title}`}
                    >
                      {DISEASE_LABEL[d] ?? d}
                    </h2>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-navy-700">
                    {info.summary}
                  </p>
                  {info.resources && info.resources.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {info.resources.map((r) => (
                        <li key={r.url}>
                          <ResourceLink resource={r} />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Fontes confiáveis (gerais) */}
        <div className="card mt-6">
          <h2 className="text-sm font-semibold text-navy-700">
            Fontes confiáveis para saber mais
          </h2>
          <p className="mt-1 text-xs text-navy-400">
            Materiais oficiais, em português, para pacientes.
          </p>
          <ul className="mt-3 space-y-1.5">
            {GENERAL_SOURCES.map((r) => (
              <li key={r.url}>
                <ResourceLink resource={r} />
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-navy-400">
          Estas informações têm caráter educativo. Em caso de dúvidas ou
          sintomas novos, fale com o Dr. Eldo Chaves.
        </p>
      </main>
      <Footer />
    </>
  );
}

function ResourceLink({ resource }: { resource: { title: string; source: string; url: string } }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 rounded-xl border border-navy-100 px-3 py-2 text-sm transition hover:border-teal-300 hover:bg-teal-50/40"
    >
      <span>
        <span className="font-medium text-navy-800">{resource.title}</span>
        <span className="block text-xs text-navy-400">{resource.source}</span>
      </span>
      <span className="shrink-0 text-teal-600">↗</span>
    </a>
  );
}
