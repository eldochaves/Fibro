import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { PrintButton } from "@/components/PrintButton";
import { SeverityChart, type ChartPoint } from "@/components/SeverityChart";
import { AdminPatientEditor } from "./AdminPatientEditor";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";
import { DeleteUserButton } from "./DeleteUserButton";
import { PainDiaryToggle } from "./PainDiaryToggle";
import { PatientCareEditor } from "./PatientCareEditor";
import { PainEpisodeList, type PainEpisode } from "@/components/PainEpisodeList";
import { Avatar } from "@/components/Avatar";
import { formatCPF, formatPhone } from "@/lib/masks";
import { DISEASE_LABEL, RESPONSE_QUESTIONNAIRES } from "@/lib/questionnaires";
import {
  BODY_AREAS,
  SSS_SEVERITY_ITEMS,
  SSS_SYMPTOM_ITEMS,
  type FibroAnswers,
} from "@/lib/acr2016";

export const dynamic = "force-dynamic";

const AREA_LABEL = new Map(BODY_AREAS.map((a) => [a.id, a.label]));

interface QrRow {
  id: string;
  questionnaire_key: string;
  created_at: string;
  score: number | null;
  summary: Record<string, unknown> | null;
}

function summaryLine(key: string, s: Record<string, unknown> | null): string {
  if (!s) return "";
  if (key === "fiqr")
    return `Função ${s.function}/30 · Impacto ${s.overall}/20 · Sintomas ${s.symptoms}/50`;
  if (key === "pcs")
    return (
      `Ruminação ${s.rumination}/16 · Magnificação ${s.magnification}/12 · Desamparo ${s.helplessness}/24` +
      (s.category ? ` · ${s.category}` : "") +
      (s.clinical ? " · ≥30 (relevante)" : "")
    );
  if (typeof s.category === "string") return s.category;
  return "";
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [
    { data: profile },
    { data: assessments },
    { data: episodes },
    { data: fiqrData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, email, cpf, birth_date, phone, avatar_url, pain_diary_enabled, diseases, questionnaires, questionnaire_freq"
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
    supabase
      .from("questionnaire_responses")
      .select("id, questionnaire_key, created_at, score, summary")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();
  const list = assessments ?? [];
  const painEpisodes = episodes ?? [];

  // Agrupa respostas genéricas (FIQR, CSI, PCS…) por questionário
  const qrAll = (fiqrData ?? []) as QrRow[];
  const qrByKey = new Map<string, QrRow[]>();
  for (const r of qrAll) {
    if (!qrByKey.has(r.questionnaire_key)) qrByKey.set(r.questionnaire_key, []);
    qrByKey.get(r.questionnaire_key)!.push(r);
  }

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
          className="mb-4 inline-block text-sm font-medium text-teal-600 print:hidden"
        >
          ← Voltar para pacientes
        </Link>

        <div className="card mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar url={profile.avatar_url} name={profile.full_name} size={56} />
              <div>
                <h1 className="font-display text-2xl font-semibold text-navy-800">
                  {profile.full_name || "(sem nome)"}
                </h1>
                <p className="text-sm text-navy-400">{profile.email}</p>
              </div>
            </div>
            <PrintButton />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-navy-400">
            {profile.cpf && <span>CPF: {formatCPF(profile.cpf)}</span>}
            {profile.birth_date && (
              <span>Nascimento: {formatDate(profile.birth_date)}</span>
            )}
            {profile.phone && <span>Telefone: {formatPhone(profile.phone)}</span>}
          </div>
          {(profile.diseases ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile.diseases as string[]).map((d) => (
                <span key={d} className="chip-teal">
                  {DISEASE_LABEL[d] ?? d}
                </span>
              ))}
            </div>
          )}
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
        </div>

        <div className="mb-6">
          <PatientCareEditor
            userId={profile.id}
            initialDiseases={(profile.diseases as string[]) ?? []}
            initialQuestionnaires={(profile.questionnaires as string[]) ?? []}
            initialFreq={
              (profile.questionnaire_freq as Record<string, string>) ?? {}
            }
          />
        </div>

        <div className="mb-6">
          <PainDiaryToggle
            userId={profile.id}
            initialEnabled={profile.pain_diary_enabled === true}
          />
        </div>

        {chartPoints.length >= 2 && (
          <div className="card mb-6">
            <h2 className="mb-2 text-sm font-semibold text-navy-700">
              Evolução
            </h2>
            <SeverityChart points={chartPoints} />
          </div>
        )}

        <h2 className="mb-3 text-sm font-semibold text-navy-700">
          Avaliações ({list.length})
        </h2>

        {list.length === 0 ? (
          <div className="card text-navy-500">
            Este paciente ainda não preencheu nenhuma avaliação.
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((a) => {
              const answers = a.answers as FibroAnswers;
              return (
                <details key={a.id} className="card" open={a === list[0]}>
                  <summary className="flex cursor-pointer items-center justify-between">
                    <span className="text-sm font-semibold text-navy-800">
                      {formatDateTime(a.created_at)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        a.meets_criteria
                          ? "bg-amber-100 text-amber-800"
                          : "bg-navy-100 text-navy-500"
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
                      <h4 className="font-semibold text-navy-700">
                        Áreas com dor ({answers.painAreas.length})
                      </h4>
                      <p className="text-navy-500">
                        {answers.painAreas.length === 0
                          ? "Nenhuma"
                          : answers.painAreas
                              .map((id) => AREA_LABEL.get(id) ?? id)
                              .join(", ")}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-navy-700">Severidade</h4>
                      <ul className="text-navy-500">
                        {SSS_SEVERITY_ITEMS.map((item) => (
                          <li key={item.id}>
                            {item.label}: {answers.severity[item.id]}/3
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-navy-700">
                        Outros sintomas
                      </h4>
                      <ul className="text-navy-500">
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

                  <div className="mt-4 flex justify-end border-t border-navy-100 pt-3">
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

        {RESPONSE_QUESTIONNAIRES.map((def) => {
          const rows = qrByKey.get(def.key) ?? [];
          if (rows.length === 0) return null;
          const chart: ChartPoint[] = [...rows]
            .reverse()
            .map((r) => ({ date: r.created_at, score: Number(r.score ?? 0) }));
          return (
            <div key={def.key} className="mt-8">
              <h2 className="mb-3 text-sm font-semibold text-navy-700">
                {def.name} ({rows.length})
              </h2>
              {chart.length >= 2 && (
                <div className="card mb-3">
                  <SeverityChart
                    points={chart}
                    maxScore={def.maxScore}
                    caption={`Escore do ${def.indexLabel} (0–${def.maxScore}) ao longo do tempo.`}
                  />
                </div>
              )}
              <ul className="space-y-3">
                {rows.map((r) => {
                  const line = summaryLine(def.key, r.summary);
                  return (
                    <li
                      key={r.id}
                      className="card flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-navy-800">
                          {formatDateTime(r.created_at)}
                        </div>
                        {line && (
                          <div className="mt-1 text-xs text-navy-400">{line}</div>
                        )}
                      </div>
                      <span className="chip-teal">
                        {r.score}/{def.maxScore}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {profile.pain_diary_enabled && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-navy-700">
              Diário de Dor ({painEpisodes.length})
            </h2>
            <PainEpisodeList episodes={painEpisodes as PainEpisode[]} />
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-red-100 bg-red-50/40 p-4 print:hidden">
          <h2 className="text-sm font-semibold text-red-700">Zona de risco</h2>
          <p className="mb-3 mt-1 text-xs text-navy-500">
            Excluir o paciente remove a conta e todos os dados (avaliações e
            diário). Não pode ser desfeito.
          </p>
          <DeleteUserButton
            userId={profile.id}
            name={profile.full_name || "(sem nome)"}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-50 px-3 py-2">
      <div className="text-xs text-navy-400">{label}</div>
      <div className="text-lg font-bold text-navy-900">{value}</div>
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
