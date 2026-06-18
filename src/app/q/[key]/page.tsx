import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { normalizeFrequency, isAvailableNow } from "@/lib/availability";
import { SCORED_DEFS } from "@/lib/lequesne";
import { QUESTIONNAIRE_BY_KEY } from "@/lib/questionnaires";
import { ScoredChoiceForm } from "@/components/ScoredChoiceForm";

export const dynamic = "force-dynamic";

interface QrRow {
  id: string;
  created_at: string;
  score: number | null;
  by_doctor: boolean | null;
  summary: { category?: string | null } | null;
}

export default async function ScoredQuestionnairePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const def = SCORED_DEFS[key];
  const meta = QUESTIONNAIRE_BY_KEY[key];
  if (!def || !meta) redirect("/inicio");
  if (!(profile?.questionnaires ?? []).includes(key)) redirect("/inicio");

  const { data } = await supabase
    .from("questionnaire_responses")
    .select("id, created_at, score, summary, by_doctor")
    .eq("questionnaire_key", key)
    .order("created_at", { ascending: false });
  const history = (data ?? []) as QrRow[];

  const freq = normalizeFrequency(profile?.questionnaire_freq?.[key]);
  const available = isAvailableNow(
    freq,
    history[0]?.created_at ?? null,
    profile?.questionnaire_requests?.[key]
  );

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
        <h1 className="font-display text-2xl font-semibold text-navy-800">
          {meta.name}
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">{meta.description}</p>

        {available ? (
          <ScoredChoiceForm questionnaireKey={key} />
        ) : (
          <div className="card text-center text-navy-500">
            <div className="mb-2 text-3xl">✅</div>
            <p>
              Você já respondeu este questionário. Ele ficará disponível
              novamente conforme a orientação do seu médico.
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">
              Respostas anteriores ({history.length})
            </h2>
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="card flex items-center justify-between">
                  <div className="text-sm font-semibold text-navy-800">
                    {formatDate(h.created_at)}
                    {h.summary?.category && (
                      <span className="ml-2 font-normal text-navy-400">
                        {h.summary.category}
                      </span>
                    )}
                  </div>
                  <span className="chip-teal">
                    {h.score}/{meta.maxScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
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
