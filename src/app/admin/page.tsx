import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { getContext } from "@/lib/session";
import {
  RESPONSE_QUESTIONNAIRES,
  QUESTIONNAIRE_BY_KEY,
} from "@/lib/questionnaires";
import { normalizeFrequency, isPending } from "@/lib/availability";
import { AdminPatientsList, type PatientSummary } from "./AdminPatientsList";

export const dynamic = "force-dynamic";

interface AssessmentRow {
  user_id: string;
  created_at: string;
  severity_score: number;
  meets_criteria: boolean;
}

interface QrRow {
  user_id: string;
  questionnaire_key: string;
  created_at: string;
  score: number | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  diseases: string[] | null;
  questionnaires: string[] | null;
  questionnaire_freq: Record<string, string> | null;
  questionnaire_requests: Record<string, string> | null;
  questionnaire_dismissed: Record<string, string> | null;
}

const DAY = 86400000;

export default async function AdminPage() {
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [{ data: profiles }, { data: assessments }, { data: qrs }, { data: admins }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, avatar_url, diseases, questionnaires, questionnaire_freq, questionnaire_requests, questionnaire_dismissed"
        ),
      supabase
        .from("assessments")
        .select("user_id, created_at, severity_score, meets_criteria")
        .order("created_at", { ascending: false }),
      supabase
        .from("questionnaire_responses")
        .select("user_id, questionnaire_key, created_at, score")
        .order("created_at", { ascending: false }),
      supabase.from("admin_emails").select("email"),
    ]);

  const adminEmails = new Set(
    (admins ?? []).map((a: { email: string }) => a.email.toLowerCase())
  );
  const profileList = ((profiles ?? []) as ProfileRow[]).filter(
    (p) => !p.email || !adminEmails.has(p.email.toLowerCase())
  );
  const patientIds = new Set(profileList.map((p) => p.id));
  const assessmentList = (assessments ?? []) as AssessmentRow[];
  const qrList = (qrs ?? []) as QrRow[];

  // Avaliações ACR agrupadas por paciente (recente → antiga)
  const byUser = new Map<string, AssessmentRow[]>();
  for (const a of assessmentList) {
    if (!byUser.has(a.user_id)) byUser.set(a.user_id, []);
    byUser.get(a.user_id)!.push(a);
  }
  // Última resposta de cada questionário genérico
  const latestQr = new Map<string, QrRow>();
  for (const r of qrList) {
    const k = `${r.user_id}|${r.questionnaire_key}`;
    if (!latestQr.has(k)) latestQr.set(k, r);
  }

  function lastDate(userId: string, key: string): string | null {
    if (key === "acr2016") return byUser.get(userId)?.[0]?.created_at ?? null;
    return latestQr.get(`${userId}|${key}`)?.created_at ?? null;
  }

  const patients: PatientSummary[] = profileList
    .map((p) => {
      const list = byUser.get(p.id) ?? [];
      const latestAcr = list[0];
      const indices: PatientSummary["indices"] = [];
      let latestTs = latestAcr ? Date.parse(latestAcr.created_at) : 0;

      if (latestAcr) {
        indices.push({
          label: "FS",
          value: latestAcr.severity_score,
          suffix: "/31",
          highlight: latestAcr.meets_criteria,
        });
      }
      for (const def of RESPONSE_QUESTIONNAIRES) {
        const r = latestQr.get(`${p.id}|${def.key}`);
        if (r) {
          indices.push({
            label: def.indexLabel,
            value: Number(r.score ?? 0),
            suffix: `/${def.maxScore}`,
          });
          latestTs = Math.max(latestTs, Date.parse(r.created_at));
        }
      }

      // Pendência: questionário programado disponível agora
      const freqMap = p.questionnaire_freq ?? {};
      const reqMap = p.questionnaire_requests ?? {};
      const dismMap = p.questionnaire_dismissed ?? {};
      let pending = false;
      for (const key of p.questionnaires ?? []) {
        if (!QUESTIONNAIRE_BY_KEY[key]) continue;
        const freq = normalizeFrequency(freqMap[key]);
        if (isPending(freq, lastDate(p.id, key), reqMap[key], dismMap[key])) {
          pending = true;
          break;
        }
      }

      return {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        avatarUrl: p.avatar_url,
        diseases: p.diseases ?? [],
        indices,
        pending,
        latestDate: latestTs ? new Date(latestTs).toISOString() : null,
      };
    })
    .sort((a, b) => {
      const ta = a.latestDate ? Date.parse(a.latestDate) : 0;
      const tb = b.latestDate ? Date.parse(b.latestDate) : 0;
      return tb - ta;
    });

  const pendingCount = patients.filter((p) => p.pending).length;

  // Atividade recente (avaliações + respostas)
  const nameById = new Map(profileList.map((p) => [p.id, p.full_name]));
  const avatarById = new Map(profileList.map((p) => [p.id, p.avatar_url]));
  type Ev = { userId: string; label: string; ts: number };
  const events: Ev[] = [];
  for (const a of assessmentList) {
    if (!patientIds.has(a.user_id)) continue;
    events.push({
      userId: a.user_id,
      label: "Avaliação ACR 2016",
      ts: Date.parse(a.created_at),
    });
  }
  for (const r of qrList) {
    if (!patientIds.has(r.user_id)) continue;
    events.push({
      userId: r.user_id,
      label: QUESTIONNAIRE_BY_KEY[r.questionnaire_key]?.name ?? "Questionário",
      ts: Date.parse(r.created_at),
    });
  }
  events.sort((a, b) => b.ts - a.ts);
  const recent = events.slice(0, 8);
  const last7 = events.filter((e) => e.ts >= Date.now() - 7 * DAY).length;

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
              Painel do médico
            </h1>
            <p className="mt-1 text-sm text-navy-400">
              Acompanhe seus pacientes e os questionários.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href="/admin/saude" className="btn-outline">
              📚 Informações ao paciente
            </Link>
            <Link href="/admin/novo" className="btn-outline">
              + Novo paciente
            </Link>
            <Link href="/admin/convite" className="btn-primary">
              Convite / QR
            </Link>
          </div>
        </div>

        {/* Indicadores */}
        <div className="mb-6 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Stat label="Pacientes" value={patients.length} />
          <StatLink
            href="/admin/lembretes"
            label="Com pendência"
            value={pendingCount}
            tone={pendingCount > 0 ? "amber" : "muted"}
          />
          <Stat label="Respostas (7 dias)" value={last7} />
          <Stat label="Respostas (total)" value={events.length} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdminPatientsList patients={patients} />
          </div>

          {/* Atividade recente */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-navy-700">
              Atividade recente
            </h2>
            {recent.length === 0 ? (
              <div className="card text-sm text-navy-400">
                Nenhuma resposta ainda.
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.map((e, i) => (
                  <li key={i}>
                    <Link
                      href={`/admin/${e.userId}`}
                      className="card flex items-center gap-3 px-3 py-2.5 hover:border-teal-300"
                    >
                      <Avatar
                        url={avatarById.get(e.userId) ?? null}
                        name={nameById.get(e.userId) ?? null}
                        size={32}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-navy-800">
                          {nameById.get(e.userId) || "(sem nome)"}
                        </div>
                        <div className="truncate text-xs text-navy-400">
                          {e.label} · {timeAgo(e.ts)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const d = Math.floor(diff / DAY);
  if (d <= 0) return "hoje";
  if (d === 1) return "ontem";
  if (d < 30) return `há ${d} dias`;
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-teal-600">{value}</div>
      <div className="text-xs text-navy-400">{label}</div>
    </div>
  );
}

function StatLink({
  href,
  label,
  value,
  tone,
}: {
  href: string;
  label: string;
  value: number;
  tone: "amber" | "muted";
}) {
  return (
    <Link
      href={href}
      className={`card text-center transition hover:shadow-card ${
        tone === "amber" ? "border-amber-200 bg-amber-50" : ""
      }`}
    >
      <div
        className={`text-2xl font-bold ${
          tone === "amber" ? "text-amber-700" : "text-teal-600"
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-navy-400">{label} 🔔</div>
    </Link>
  );
}
