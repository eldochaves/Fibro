import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { PrintButton } from "@/components/PrintButton";
import {
  QuestionnaireResultCard,
  type ResultRow,
} from "@/components/QuestionnaireResultCard";
import { AdminPatientEditor } from "./AdminPatientEditor";
import { DeleteAssessmentButton } from "./DeleteAssessmentButton";
import { DeleteUserButton } from "./DeleteUserButton";
import { PainDiaryToggle } from "./PainDiaryToggle";
import { PatientCareEditor } from "./PatientCareEditor";
import { PainEpisodeList, type PainEpisode } from "@/components/PainEpisodeList";
import { Avatar } from "@/components/Avatar";
import { Tabs } from "@/components/Tabs";
import { ClinicalSummary, type SummaryMetric } from "@/components/ClinicalSummary";
import { formatCPF, formatPhone } from "@/lib/masks";
import {
  DISEASE_LABEL,
  DISEASES,
  QUESTIONNAIRES,
  RESPONSE_QUESTIONNAIRES,
  QUESTIONNAIRE_BY_KEY,
  REGION_LABEL,
  REGION_ORDER,
  type QuestionnaireDef,
} from "@/lib/questionnaires";
import { diseaseTheme } from "@/lib/diseaseTheme";
import {
  normalizeFrequency,
  isPending,
  hasOpenRequest,
} from "@/lib/availability";
import { RequestQuestionnaire, type RequestItem } from "./RequestQuestionnaire";
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
  by_doctor: boolean | null;
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
  if (key === "womac")
    return `Dor ${s.pain}/20 · Rigidez ${s.stiffness}/8 · Função ${s.function}/68`;
  if (key === "bpi")
    return `Gravidade ${s.severity}/10 · Interferência ${s.interference}/10`;
  if (Array.isArray(s.subscales))
    return (s.subscales as { title: string; score: number }[])
      .map((x) => `${x.title} ${x.score}`)
      .join(" · ");
  if (typeof s.met === "boolean")
    return `${s.met ? "Atende" : "Não atende"} · ${s.count} item(ns)`;
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
        "id, full_name, email, cpf, birth_date, phone, avatar_url, pain_diary_enabled, diseases, questionnaires, questionnaire_freq, questionnaire_requests, questionnaire_dismissed"
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
      .select("id, questionnaire_key, created_at, score, summary, by_doctor")
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

  // Monta as linhas de resultado de cada questionário (ACR vem de assessments;
  // os demais de questionnaire_responses).
  function buildRows(def: QuestionnaireDef): ResultRow[] {
    if (def.key === "acr2016") {
      return list.map((a) => ({
        id: a.id,
        date: a.created_at,
        score: a.severity_score,
        scoreText: `${a.severity_score}/31`,
        by_doctor: a.by_doctor === true,
        line: `WPI ${a.wpi}/19 · SSS ${a.sss}/12 · Regiões com dor ${a.regions_with_pain}/5`,
        met: a.meets_criteria === true,
      }));
    }
    const rows = qrByKey.get(def.key) ?? [];
    const isCrit = def.kind === "criterio";
    return rows.map((r) => {
      const s = r.summary as Record<string, unknown> | null;
      const met = typeof s?.met === "boolean" ? (s.met as boolean) : null;
      return {
        id: r.id,
        date: r.created_at,
        score: Number(r.score ?? 0),
        scoreText: isCrit
          ? `${r.score}/${def.maxScore} itens`
          : `${r.score}/${def.maxScore}`,
        by_doctor: r.by_doctor === true,
        line: summaryLine(def.key, r.summary),
        met,
      };
    });
  }

  const rowsByKey = new Map<string, ResultRow[]>();
  const dataDefs: QuestionnaireDef[] = [];
  for (const def of QUESTIONNAIRES) {
    const rows = buildRows(def);
    if (rows.length > 0) {
      rowsByKey.set(def.key, rows);
      dataDefs.push(def);
    }
  }

  // Agrupa os questionários com respostas por doença (na ordem: doenças atuais
  // do paciente primeiro) e, dentro da doença, por região anatômica.
  const patientDiseases = (profile.diseases as string[]) ?? [];
  const diseaseOrder = [
    ...DISEASES.filter((d) => patientDiseases.includes(d.key)),
    ...DISEASES.filter((d) => !patientDiseases.includes(d.key)),
  ];
  const diseaseGroups = diseaseOrder
    .map((d) => ({
      key: d.key,
      label: DISEASE_LABEL[d.key],
      defs: dataDefs.filter((q) => q.diseases.includes(d.key)),
    }))
    .filter((g) => g.defs.length > 0);
  const genericDefs = dataDefs.filter((q) => q.diseases.length === 0);

  // Resumo clínico (últimos escores + tendência)
  const summary: SummaryMetric[] = [];
  if (list[0]) {
    summary.push({
      label: "FS",
      value: list[0].severity_score,
      max: 31,
      prev: list[1]?.severity_score ?? null,
      highlight: list[0].meets_criteria,
    });
  }
  for (const def of RESPONSE_QUESTIONNAIRES) {
    const rows = qrByKey.get(def.key) ?? [];
    if (rows[0]) {
      summary.push({
        label: def.indexLabel,
        value: Number(rows[0].score ?? 0),
        max: def.maxScore,
        prev: rows[1] ? Number(rows[1].score ?? 0) : null,
        higherIsBetter: def.higherIsBetter,
      });
    }
  }

  // Status para "solicitar nova resposta"
  const freqMap = (profile.questionnaire_freq as Record<string, string>) ?? {};
  const reqMap =
    (profile.questionnaire_requests as Record<string, string>) ?? {};
  const dismMap =
    (profile.questionnaire_dismissed as Record<string, string>) ?? {};
  const lastFor = (key: string): string | null =>
    key === "acr2016"
      ? list[0]?.created_at ?? null
      : qrByKey.get(key)?.[0]?.created_at ?? null;
  const requestItems: RequestItem[] = ((profile.questionnaires as string[]) ?? [])
    .filter((k) => QUESTIONNAIRE_BY_KEY[k])
    .map((key) => {
      const freq = normalizeFrequency(freqMap[key]);
      const last = lastFor(key);
      const requested = reqMap[key];
      return {
        key,
        name: QUESTIONNAIRE_BY_KEY[key].name,
        pending: isPending(freq, last, requested, dismMap[key]),
        hasRequest: hasOpenRequest(requested, last),
      };
    });

  // Avaliações antes de critérios; e separação por região dentro da doença.
  const ordKind = (a: QuestionnaireDef, b: QuestionnaireDef) =>
    (a.kind === "criterio" ? 1 : 0) - (b.kind === "criterio" ? 1 : 0);

  function regionSplit(defs: QuestionnaireDef[]) {
    const noRegion = [...defs].filter((q) => !q.region).sort(ordKind);
    const groups = REGION_ORDER.map((r) => ({
      label: REGION_LABEL[r],
      items: defs.filter((q) => q.region === r).sort(ordKind),
    })).filter((g) => g.items.length > 0);
    return { noRegion, groups };
  }

  function renderCards(defs: QuestionnaireDef[]) {
    return defs.map((def) => (
      <QuestionnaireResultCard
        key={def.key}
        def={def}
        rows={rowsByKey.get(def.key)!}
      />
    ));
  }

  // Detalhamento granular do ACR 2016 (áreas, severidade, sintomas) — fica
  // dentro do grupo da Fibromialgia.
  const acrDetail = (
    <details className="card mt-4">
      <summary className="cursor-pointer text-sm font-semibold text-navy-700">
        Respostas detalhadas — ACR 2016 ({list.length})
      </summary>
      <div className="mt-4 space-y-4">
        {list.map((a) => {
          const answers = a.answers as FibroAnswers;
          return (
            <div key={a.id} className="rounded-xl border border-navy-100 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                  {formatDateTime(a.created_at)}
                  {a.by_doctor && <ByDoctorBadge />}
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
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="WPI" value={`${a.wpi}/19`} />
                <Metric label="SSS" value={`${a.sss}/12`} />
                <Metric label="Regiões" value={`${a.regions_with_pain}/5`} />
                <Metric label="FS (total)" value={`${a.severity_score}/31`} />
              </div>

              <div className="mt-3 space-y-3 text-sm">
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
                  <h4 className="font-semibold text-navy-700">Outros sintomas</h4>
                  <ul className="text-navy-500">
                    {SSS_SYMPTOM_ITEMS.map((item) => (
                      <li key={item.id}>
                        {item.label}: {answers.symptoms[item.id] ? "Sim" : "Não"}
                      </li>
                    ))}
                    <li>
                      Sintomas há ≥ 3 meses: {answers.threeMonths ? "Sim" : "Não"}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 flex justify-end border-t border-navy-100 pt-3">
                <DeleteAssessmentButton assessmentId={a.id} userId={userId} />
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );

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

        {/* Cabeçalho do paciente */}
        <div className="card mb-5">
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
            <div className="flex shrink-0 flex-col items-end gap-2 print:hidden">
              <PrintButton />
              <Link
                href={`/admin/convite?name=${encodeURIComponent(
                  profile.full_name || ""
                )}&phone=${encodeURIComponent(profile.phone || "")}`}
                className="text-sm font-medium text-teal-600 hover:underline"
              >
                📲 Convite / QR
              </Link>
            </div>
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
              {(profile.diseases as string[]).map((d) => {
                const theme = diseaseTheme(d);
                return (
                  <span
                    key={d}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${theme.chipActive}`}
                  >
                    <span>{theme.icon}</span>
                    {DISEASE_LABEL[d] ?? d}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo clínico */}
        {summary.length > 0 && (
          <div className="mb-6">
            <ClinicalSummary metrics={summary} />
          </div>
        )}

        <Tabs tabs={["Acompanhamento", "Respostas", "Diário", "Dados"]}>
          {/* ===== ACOMPANHAMENTO ===== */}
          <div className="space-y-6">
            <PatientCareEditor
              userId={profile.id}
              initialDiseases={(profile.diseases as string[]) ?? []}
              initialQuestionnaires={(profile.questionnaires as string[]) ?? []}
              initialFreq={
                (profile.questionnaire_freq as Record<string, string>) ?? {}
              }
            />

            <div className="card print:hidden">
              <h2 className="font-display text-lg font-semibold text-navy-800">
                Solicitar nova resposta
              </h2>
              <p className="mb-3 mt-1 text-sm text-navy-500">
                Reabra um questionário para o paciente responder novamente —
                inclusive os marcados como &quot;apenas uma vez&quot;.
              </p>
              <RequestQuestionnaire userId={profile.id} items={requestItems} />
            </div>

            <PainDiaryToggle
              userId={profile.id}
              initialEnabled={profile.pain_diary_enabled === true}
            />
          </div>

          {/* ===== RESPOSTAS ===== */}
          <div className="space-y-8">
            {/* Legenda didática */}
            <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4">
              <p className="text-sm font-semibold text-navy-700">
                Como ler esta aba
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-navy-600">
                <li>
                  <span className="font-semibold text-green-600">verde</span> =
                  melhorou em relação à vez anterior ·{" "}
                  <span className="font-semibold text-red-600">vermelho</span> =
                  piorou · <span className="text-navy-400">→ estável</span>.
                </li>
                <li>
                  Cada cartão diz se, naquele instrumento,{" "}
                  <strong>maior = melhor</strong> ou{" "}
                  <strong>maior = pior</strong>.
                </li>
                <li>
                  Critérios mostram se o paciente <strong>atende</strong> ou não
                  à definição diagnóstica/classificatória.
                </li>
              </ul>
            </div>

            {diseaseGroups.length === 0 && genericDefs.length === 0 ? (
              <div className="card text-navy-500">
                Nenhuma resposta registrada ainda. Libere questionários na aba{" "}
                <strong>Acompanhamento</strong>.
              </div>
            ) : (
              <>
                {diseaseGroups.map((group) => {
                  const { noRegion, groups } = regionSplit(group.defs);
                  const theme = diseaseTheme(group.key);
                  return (
                    <section key={group.key}>
                      <h2
                        className={`mb-3 flex items-center gap-2 border-l-4 pl-2 font-display text-lg font-semibold ${theme.accentBorder} ${theme.title}`}
                      >
                        <span>{theme.icon}</span>
                        {group.label}
                      </h2>
                      <div className="space-y-4">
                        {renderCards(noRegion)}
                        {groups.map((g) => (
                          <div key={g.label}>
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
                              {g.label}
                            </div>
                            <div className="space-y-4">
                              {renderCards(g.items)}
                            </div>
                          </div>
                        ))}
                      </div>
                      {group.key === "fibromialgia" &&
                        list.length > 0 &&
                        acrDetail}
                    </section>
                  );
                })}

                {genericDefs.length > 0 && (
                  <section>
                    <h2 className="mb-3 border-l-4 border-navy-300 pl-2 font-display text-lg font-semibold text-navy-800">
                      Dor (geral)
                    </h2>
                    <div className="space-y-4">{renderCards(genericDefs)}</div>
                  </section>
                )}
              </>
            )}
          </div>

          {/* ===== DIÁRIO ===== */}
          <div>
            {profile.pain_diary_enabled ? (
              <>
                <h2 className="mb-3 text-sm font-semibold text-navy-700">
                  Diário de Dor ({painEpisodes.length})
                </h2>
                <PainEpisodeList episodes={painEpisodes as PainEpisode[]} />
              </>
            ) : (
              <div className="card text-center text-navy-500">
                O Diário de Dor não está habilitado para este paciente. Habilite
                na aba <strong>Acompanhamento</strong>.
              </div>
            )}
          </div>

          {/* ===== DADOS ===== */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-navy-800">
                Dados do paciente
              </h2>
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

            <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 print:hidden">
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
          </div>
        </Tabs>
      </main>
      <Footer />
    </>
  );
}

function ByDoctorBadge() {
  return (
    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-medium text-navy-600">
      👨‍⚕️ pelo médico
    </span>
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
