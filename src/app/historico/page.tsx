import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";

export const dynamic = "force-dynamic";

interface Entry {
  id: string;
  name: string;
  date: string;
  byDoctor: boolean;
}

export default async function HistoricoPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const [{ data: assessments }, { data: responses }] = await Promise.all([
    supabase
      .from("assessments")
      .select("id, created_at, by_doctor")
      .order("created_at", { ascending: false }),
    supabase
      .from("questionnaire_responses")
      .select("id, questionnaire_key, created_at, by_doctor")
      .order("created_at", { ascending: false }),
  ]);

  const entries: Entry[] = [
    ...(assessments ?? []).map((a) => ({
      id: a.id,
      name:
        QUESTIONNAIRE_BY_KEY["acr2016"]?.name ?? "Avaliação de Fibromialgia",
      date: a.created_at as string,
      byDoctor: a.by_doctor === true,
    })),
    ...(responses ?? []).map((r) => ({
      id: r.id,
      name: QUESTIONNAIRE_BY_KEY[r.questionnaire_key]?.name ?? "Questionário",
      date: r.created_at as string,
      byDoctor: r.by_doctor === true,
    })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

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
          Minhas respostas
        </h1>
        <p className="mt-1 text-base text-navy-500">
          Aqui ficam registradas as suas respostas. Quem analisa os resultados é
          o Dr. Eldo Chaves, no seu acompanhamento. 🌿
        </p>

        {profile?.pain_diary_enabled && (
          <Link
            href="/diario"
            className="card mt-6 flex items-center justify-between hover:border-teal-300"
          >
            <div>
              <div className="text-sm font-semibold text-navy-800">
                📒 Diário de Dor
              </div>
              <div className="text-xs text-navy-400">
                Registre seus episódios de dor
              </div>
            </div>
            <span className="text-teal-600">→</span>
          </Link>
        )}

        {entries.length === 0 ? (
          <div className="card mt-6 text-center">
            <div className="text-3xl">📝</div>
            <p className="mt-2 text-navy-500">
              Você ainda não enviou nenhuma resposta. Quando o Dr. Eldo liberar
              um questionário, ele aparecerá no seu início.
            </p>
            <Link href="/inicio" className="btn-primary mt-4 inline-flex">
              Ver o que está disponível
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3 text-sm text-navy-700">
              👏 {firstName ? `${firstName}, você` : "Você"} já enviou{" "}
              <strong>{entries.length}</strong>{" "}
              {entries.length === 1 ? "resposta" : "respostas"}. Obrigado por
              cuidar da sua saúde junto com a gente!
            </div>

            <ul className="mt-4 space-y-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="card flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-navy-800">
                      {e.name}
                    </div>
                    <div className="mt-0.5 text-xs text-navy-400">
                      Enviado em {formatDate(e.date)}
                      {e.byDoctor && " · preenchido com o médico"}
                    </div>
                  </div>
                  <span className="chip-teal shrink-0">Enviado ✓</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/perfil"
            className="text-sm font-medium text-teal-600 underline"
          >
            Editar meus dados
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
