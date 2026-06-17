import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext } from "@/lib/session";
import { RESPONSE_QUESTIONNAIRES } from "@/lib/questionnaires";
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
}

export default async function AdminPage() {
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [{ data: profiles }, { data: assessments }, { data: qrs }, { data: admins }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, diseases"),
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

  // Emails de médicos não devem aparecer como pacientes
  const adminEmails = new Set(
    (admins ?? []).map((a: { email: string }) => a.email.toLowerCase())
  );
  const profileList = ((profiles ?? []) as ProfileRow[]).filter(
    (p) => !p.email || !adminEmails.has(p.email.toLowerCase())
  );
  const assessmentList = (assessments ?? []) as AssessmentRow[];
  const qrList = (qrs ?? []) as QrRow[];

  // Agrupa avaliações ACR por paciente (já vêm da mais recente para a mais antiga)
  const byUser = new Map<string, AssessmentRow[]>();
  for (const a of assessmentList) {
    if (!byUser.has(a.user_id)) byUser.set(a.user_id, []);
    byUser.get(a.user_id)!.push(a);
  }

  // Última resposta de cada questionário genérico (FIQR etc.) por paciente
  const latestQr = new Map<string, QrRow>(); // chave: `${user}|${key}`
  for (const r of qrList) {
    const k = `${r.user_id}|${r.questionnaire_key}`;
    if (!latestQr.has(k)) latestQr.set(k, r);
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

      return {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        avatarUrl: p.avatar_url,
        diseases: p.diseases ?? [],
        indices,
        latestDate: latestTs ? new Date(latestTs).toISOString() : null,
      };
    })
    .sort((a, b) => {
      const ta = a.latestDate ? Date.parse(a.latestDate) : 0;
      const tb = b.latestDate ? Date.parse(b.latestDate) : 0;
      return tb - ta;
    });

  const totalAssessments = assessmentList.length;
  const meetingCriteria = assessmentList.filter((a) => a.meets_criteria).length;

  return (
    <>
      <Header email={user.email} isAdmin />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
              Pacientes
            </h1>
            <p className="mt-1 text-sm text-navy-400">
              Acompanhe as avaliações e o diário de dor dos seus pacientes.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Link href="/admin/lembretes" className="btn-outline">
              🔔 Lembretes
            </Link>
            <Link href="/admin/convite" className="btn-primary">
              <span className="hidden sm:inline">Convite / QR</span>
              <span className="sm:hidden">Convite / QR</span>
            </Link>
          </div>
        </div>

        <div className="mb-6 mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <Stat label="Pacientes" value={patients.length} />
          <Stat label="Avaliações" value={totalAssessments} />
          <Stat label="Critérios +" value={meetingCriteria} />
        </div>

        <AdminPatientsList patients={patients} />
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-teal-600">{value}</div>
      <div className="text-xs text-navy-400">{label}</div>
    </div>
  );
}
