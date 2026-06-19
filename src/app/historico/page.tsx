import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";
import { SeverityChart, type ChartPoint } from "@/components/SeverityChart";

export const dynamic = "force-dynamic";

interface Point {
  id: string;
  date: string;
  score: number;
  byDoctor: boolean;
}
interface Group {
  key: string;
  name: string;
  maxScore: number;
  hasNumber: boolean;
  points: Point[]; // mais recente primeiro
  latest: number;
}

export default async function HistoricoPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const [{ data: assessments }, { data: responses }] = await Promise.all([
    supabase
      .from("assessments")
      .select("id, created_at, severity_score, by_doctor")
      .order("created_at", { ascending: false }),
    supabase
      .from("questionnaire_responses")
      .select("id, questionnaire_key, created_at, score, by_doctor")
      .order("created_at", { ascending: false }),
  ]);

  // Agrupa por questionário
  const map = new Map<string, Point[]>();
  for (const a of assessments ?? []) {
    if (!map.has("acr2016")) map.set("acr2016", []);
    map.get("acr2016")!.push({
      id: a.id,
      date: a.created_at,
      score: a.severity_score,
      byDoctor: a.by_doctor === true,
    });
  }
  for (const r of responses ?? []) {
    if (!map.has(r.questionnaire_key)) map.set(r.questionnaire_key, []);
    map.get(r.questionnaire_key)!.push({
      id: r.id,
      date: r.created_at,
      score: Number(r.score ?? 0),
      byDoctor: r.by_doctor === true,
    });
  }

  const groups: Group[] = [];
  for (const [key, points] of map) {
    const def = QUESTIONNAIRE_BY_KEY[key];
    const name = def?.name ?? "Questionário";
    const maxScore = key === "acr2016" ? 31 : def?.maxScore ?? 100;
    // Critérios não mostram número (seria subsídio para autoavaliação)
    const hasNumber = key === "acr2016" || def?.kind === "avaliacao";
    groups.push({
      key,
      name,
      maxScore,
      hasNumber,
      points,
      latest: Date.parse(points[0]?.date ?? "") || 0,
    });
  }
  groups.sort((a, b) => b.latest - a.latest);

  const total = groups.reduce((n, g) => n + g.points.length, 0);
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
          Minha evolução
        </h1>
        <p className="mt-1 text-base text-navy-500">
          Acompanhe suas respostas ao longo do tempo. Os números ajudam a ver a
          evolução — quem interpreta os resultados é o Dr. Eldo Chaves. 🌿
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

        {groups.length === 0 ? (
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
              <strong>{total}</strong> {total === 1 ? "resposta" : "respostas"}.
              Obrigado por cuidar da sua saúde junto com a gente!
            </div>

            <div className="mt-6 space-y-6">
              {groups.map((g) => (
                <section key={g.key} className="card">
                  <h2 className="font-display text-base font-semibold text-navy-800">
                    {g.name}
                  </h2>

                  {g.hasNumber && (
                    <div className="mt-3">
                      <SeverityChart
                        points={
                          [...g.points]
                            .reverse()
                            .map((p) => ({
                              date: p.date,
                              score: p.score,
                            })) as ChartPoint[]
                        }
                        maxScore={g.maxScore}
                      />
                    </div>
                  )}

                  <ul className="mt-3 space-y-2">
                    {g.points.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 border-t border-navy-100 pt-2 text-sm first:border-0 first:pt-0"
                      >
                        <span className="text-navy-600">
                          {formatDate(p.date)}
                          {p.byDoctor && (
                            <span className="ml-2 text-xs text-navy-400">
                              · com o médico
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-teal-700">
                          {g.hasNumber ? `${p.score}/${g.maxScore}` : "Enviado ✓"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
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
