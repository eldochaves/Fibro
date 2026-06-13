import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext } from "@/lib/session";
import { AdminPatientsList, type PatientSummary } from "./AdminPatientsList";

export const dynamic = "force-dynamic";

interface AssessmentRow {
  user_id: string;
  created_at: string;
  severity_score: number;
  meets_criteria: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default async function AdminPage() {
  const { supabase, user, isAdmin } = await getContext();
  if (!isAdmin) redirect("/historico");

  const [{ data: profiles }, { data: assessments }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email"),
    supabase
      .from("assessments")
      .select("user_id, created_at, severity_score, meets_criteria")
      .order("created_at", { ascending: false }),
  ]);

  const profileList = (profiles ?? []) as ProfileRow[];
  const assessmentList = (assessments ?? []) as AssessmentRow[];

  // Agrupa avaliações por paciente (já vêm da mais recente para a mais antiga)
  const byUser = new Map<string, AssessmentRow[]>();
  for (const a of assessmentList) {
    if (!byUser.has(a.user_id)) byUser.set(a.user_id, []);
    byUser.get(a.user_id)!.push(a);
  }

  const patients: PatientSummary[] = profileList
    .map((p) => {
      const list = byUser.get(p.id) ?? [];
      const latest = list[0];
      return {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        count: list.length,
        latestDate: latest?.created_at ?? null,
        latestMeets: latest?.meets_criteria ?? null,
        latestScore: latest?.severity_score ?? null,
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
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold">Pacientes</h1>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <Stat label="Pacientes" value={patients.length} />
          <Stat label="Avaliações" value={totalAssessments} />
          <Stat label="Critérios +" value={meetingCriteria} />
        </div>

        <AdminPatientsList patients={patients} />
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold text-brand-600">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
