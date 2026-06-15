import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { normalizeFrequency, isAvailableNow } from "@/lib/availability";
import { FiqrForm } from "./FiqrForm";

export const dynamic = "force-dynamic";

interface QrRow {
  id: string;
  created_at: string;
  score: number | null;
  summary: { function?: number; overall?: number; symptoms?: number; category?: string } | null;
}

export default async function FiqrPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");
  if (!(profile?.questionnaires ?? []).includes("fiqr")) redirect("/inicio");

  const { data } = await supabase
    .from("questionnaire_responses")
    .select("id, created_at, score, summary")
    .eq("questionnaire_key", "fiqr")
    .order("created_at", { ascending: false });
  const history = (data ?? []) as QrRow[];

  const freq = normalizeFrequency(profile?.questionnaire_freq?.["fiqr"]);
  const available = isAvailableNow(freq, history[0]?.created_at ?? null);

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
          Impacto da Fibromialgia (FIQR)
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Responda pensando nos <strong>últimos 7 dias</strong>. Em todos os
          itens, 0 é o melhor e 10 é o pior.
        </p>

        {available ? (
          <FiqrForm />
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
                <li
                  key={h.id}
                  className="card flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-navy-800">
                      {formatDate(h.created_at)}
                    </div>
                    {h.summary && (
                      <div className="mt-1 text-xs text-navy-400">
                        Função {h.summary.function}/30 · Impacto{" "}
                        {h.summary.overall}/20 · Sintomas {h.summary.symptoms}/50
                      </div>
                    )}
                  </div>
                  <span className="chip-teal">{h.score}/100</span>
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
