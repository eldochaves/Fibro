import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext } from "@/lib/session";
import { PrintButton } from "@/components/PrintButton";
import { SeverityChart, type ChartPoint } from "@/components/SeverityChart";
import { AdminPatientEditor } from "./AdminPatientEditor";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";
import { PainDiaryToggle } from "./PainDiaryToggle";
import { PainEpisodeList, type PainEpisode } from "@/components/PainEpisodeList";
import { formatCPF, formatPhone } from "@/lib/masks";
import {
  BODY_AREAS,
  SSS_SEVERITY_ITEMS,
  SSS_SYMPTOM_ITEMS,
  type FibroAnswers,
} from "@/lib/acr2016";

export const dynamic = "force-dynamic";

const AREA_LABEL = new Map(BODY_AREAS.map((a) => [a.id, a.label]));

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [{ data: profile }, { data: assessments }, { data: episodes }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, cpf, birth_date, phone, pain_diary_enabled"
        )
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("assessments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("pain_episodes")
        .select(
          "id, episode_date, start_time, activity, location, eva, radiation, end_time"
        )
        .eq("user_id", userId)
        .order("episode_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  if (!profile) notFound();
  const list = assessments ?? [];
  const painEpisodes = episodes ?? [];

  // Pontos do gráfico em ordem cronológica crescente
  const chartPoints: ChartPoint[] = [...list]
    .reverse()
    .map((a) => ({ date: a.created_at, score: a.severity_score }));

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/admin"
          className="mb-4 inline-block text-sm font-medium text-brand-600 print:hidden"
        >
          ← Voltar para pacientes
        </Link>

        <div className="card mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                {profile.full_name || "(sem nome)"}
              </h1>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
            <PrintButton />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
            {profile.cpf && <span>CPF: {formatCPF(profile.cpf)}</span>}
            {profile.birth_date && (
              <span>Nascimento: {formatDate(profile.birth_date)}</span>
            )}
            {profile.phone && <span>Telefone: {formatPhone(profile.phone)}</span>}
          </div>
          <div className="mt-4">
            <AdminPatientEditor
              profile={{
                id: profile.id,
                full_name: profile.full_name,
                cpf: profile.cpf,
                birth_date: profile.birth_date,
                phone: profile.phone,
              }}
            />
          </div>
          <div className="mt-4">
            <PainDiaryToggle
              userId={profile.id}
              initialEnabled={profile.pain_diary_enabled === true}
            />
          </div>
        </div>

        {chartPoints.length >= 2 && (
          <div className="card mb-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">
              Evolução
            </h2>
            <SeverityChart points={chartPoints} />
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Avaliações ({list.length})
        </h2>

        {list.length === 0 ? (
          <div className="card text-slate-600">
            Este paciente ainda não preencheu nenhuma avaliação.
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((a) => {
              const answers = a.answers as FibroAnswers;
              return (
                <details key={a.id} className="card" open={a === list[0]}>
                  <summary className="flex cursor-pointer items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatDateTime(a.created_at)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        a.meets_criteria
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.meets_criteria ? "Critérios atendidos" : "Não atendidos"}
                    </span>
                  </summary>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric label="WPI" value={`${a.wpi}/19`} />
                    <Metric label="SSS" value={`${a.sss}/12`} />
                    <Metric label="Regiões" value={`${a.regions_with_pain}/5`} />
                    <Metric label="FS (total)" value={`${a.severity_score}/31`} />
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold text-slate-700">
                        Áreas com dor ({answers.painAreas.length})
                      </h4>
                      <p className="text-slate-600">
                        {answers.painAreas.length === 0
                          ? "Nenhuma"
                          : answers.painAreas
                              .map((id) => AREA_LABEL.get(id) ?? id)
                              .join(", ")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700">Severidade</h4>
                      <ul className="text-slate-600">
                        {SSS_SEVERITY_ITEMS.map((item) => (
                          <li key={item.id}>
                            {item.label}: {answers.severity[item.id]}/3
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-700">
                        Outros sintomas
                      </h4>
                      <ul className="text-slate-600">
                        {SSS_SYMPTOM_ITEMS.map((item) => (
                          <li key={item.id}>
                            {item.label}:{" "}
                            {answers.symptoms[item.id] ? "Sim" : "Não"}
                          </li>
                        ))}
                        <li>
                          Sintomas há ≥ 3 meses:{" "}
                          {answers.threeMonths ? "Sim" : "Não"}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                    <DeleteAssessmentButton
                      assessmentId={a.id}
                      userId={userId}
                    />
                  </div>
                </details>
              );
            })}
          </div>
        )}

        {profile.pain_diary_enabled && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Diário de Dor ({painEpisodes.length})
            </h2>
            <PainEpisodeList episodes={painEpisodes as PainEpisode[]} />
          </div>
        )}
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
