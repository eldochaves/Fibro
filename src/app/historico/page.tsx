import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default async function HistoricoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: assessments } = await supabase
    .from("assessments")
    .select("id, created_at, wpi, sss, severity_score, meets_criteria")
    .order("created_at", { ascending: false });

  const list = assessments ?? [];

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Meu histórico</h1>
          <Link href="/questionario" className="btn-primary">
            Nova avaliação
          </Link>
        </div>

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

        <p className="mt-8 text-center text-xs text-slate-400">
          Ferramenta de triagem (ACR 2016). Não substitui avaliação médica.
        </p>
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
