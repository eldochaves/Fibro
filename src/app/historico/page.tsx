import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, created_at, wpi, sss, severity_score, meets_criteria")
    .order("created_at", { ascending: false });

  const list = assessments ?? [];

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        {profile?.full_name && (
          <p className="mb-1 text-sm text-slate-500">
            Olá, {profile.full_name.split(" ")[0]} 👋
          </p>
        )}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Meu histórico</h1>
          <Link href="/questionario" className="btn-primary">
            Nova avaliação
          </Link>
        </div>

        {profile?.pain_diary_enabled && (
          <Link
            href="/diario"
            className="card mb-6 flex items-center justify-between hover:border-brand-300"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800">
                📒 Diário de Dor
              </div>
              <div className="text-xs text-slate-500">
                Registre seus episódios de dor
              </div>
            </div>
            <span className="text-brand-600">→</span>
          </Link>
        )}

        {list.length === 0 ? (
          <div className="card text-center">
            <p className="mb-4 text-slate-600">
              Você ainda não preencheu nenhuma avaliação.
            </p>
            <Link href="/questionario" className="btn-primary inline-flex">
              Começar avaliação
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {formatDate(a.created_at)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      WPI {a.wpi}/19 · SSS {a.sss}/12 · Escore{" "}
                      {a.severity_score}/31
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      a.meets_criteria
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.meets_criteria ? "Critérios atendidos" : "Não atendidos"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/perfil"
            className="text-sm font-medium text-brand-600 underline"
          >
            Editar meus dados
          </Link>
          <p className="mt-3 text-xs text-slate-400">
            Ferramenta de triagem (ACR 2016). Não substitui avaliação médica.
          </p>
        </div>
      </main>
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
