import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";
import { normalizeFrequency, isAvailableNow } from "@/lib/availability";
import { SeverityChart, type ChartPoint } from "@/components/SeverityChart";
import { BpiForm } from "./BpiForm";

export const dynamic = "force-dynamic";

interface QrRow {
  id: string;
  created_at: string;
  score: number | null;
  by_doctor: boolean | null;
  summary: { severity?: number; interference?: number } | null;
}

export default async function BpiPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");
  if (!(profile?.questionnaires ?? []).includes("bpi")) redirect("/inicio");

  const { data } = await supabase
    .from("questionnaire_responses")
    .select("id, created_at, score, summary, by_doctor")
    .eq("questionnaire_key", "bpi")
    .order("created_at", { ascending: false });
  const history = (data ?? []) as QrRow[];

  const freq = normalizeFrequency(profile?.questionnaire_freq?.["bpi"]);
  const available = isAvailableNow(
    freq,
    history[0]?.created_at ?? null,
    profile?.questionnaire_requests?.["bpi"]
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
          Inventário Breve de Dor (BPI)
        </h1>
        <p className="mb-6 mt-1 text-sm text-navy-500">
          Responda pensando nas <strong>últimas 24 horas</strong>. Em todos os
          itens, 0 é o melhor e 10 é o pior.
        </p>

        {available ? (
          <BpiForm />
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
              Sua evolução ({history.length})
            </h2>
            <div className="card mb-3">
              <SeverityChart
                points={
                  [...history]
                    .reverse()
                    .map((h) => ({
                      date: h.created_at,
                      score: Number(h.score ?? 0),
                    })) as ChartPoint[]
                }
                maxScore={10}
              />
              <p className="mt-1 text-center text-xs text-navy-300">
                Interferência da dor no dia a dia (0–10)
              </p>
            </div>
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="card flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-800">
                    {formatDate(h.created_at)}
                    {h.by_doctor && (
                      <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">
                        👨‍⚕️ pelo médico
                      </span>
                    )}
                  </span>
                  <span className="chip-teal">
                    {h.summary?.severity ?? "–"}/10 · {h.score}/10
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-center text-xs text-navy-400">
              Os números ajudam a acompanhar sua evolução. Quem interpreta é o
              Dr. Eldo.
            </p>
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
