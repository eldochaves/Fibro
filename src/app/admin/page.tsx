import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

interface AssessmentRow {
  id: string;
  user_id: string;
  created_at: string;
  wpi: number;
  sss: number;
  severity_score: number;
  meets_criteria: boolean;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/historico");

  const [{ data: profiles }, { data: assessments }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email"),
    supabase
      .from("assessments")
      .select("id, user_id, created_at, wpi, sss, severity_score, meets_criteria")
      .order("created_at", { ascending: false }),
  ]);

  const profileList = (profiles ?? []) as ProfileRow[];
  const assessmentList = (assessments ?? []) as AssessmentRow[];

  // Agrupa avaliações por paciente
  const byUser = new Map<string, AssessmentRow[]>();
  for (const a of assessmentList) {
    if (!byUser.has(a.user_id)) byUser.set(a.user_id, []);
    byUser.get(a.user_id)!.push(a);
  }

  // Pacientes que têm perfil; ordena por data da última avaliação
  const patients = profileList
    .map((p) => {
      const list = byUser.get(p.id) ?? [];
      return { profile: p, latest: list[0], count: list.length };
    })
    .sort((a, b) => {
      const ta = a.latest ? Date.parse(a.latest.created_at) : 0;
      const tb = b.latest ? Date.parse(b.latest.created_at) : 0;
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

        {patients.length === 0 ? (
          <div className="card text-center text-slate-600">
            Nenhum paciente cadastrou avaliações ainda.
          </div>
        ) : (
          <ul className="space-y-3">
            {patients.map(({ profile, latest, count }) => (
              <li key={profile.id}>
                <Link
                  href={`/admin/${profile.id}`}
                  className="card flex items-center justify-between hover:border-brand-300"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">
                      {profile.full_name || "(sem nome)"}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {profile.email}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {count} avaliação(ões)
                      {latest && ` · última em ${formatDate(latest.created_at)}`}
                    </div>
                  </div>
                  {latest && (
                    <span
                      className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        latest.meets_criteria
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      FS {latest.severity_score}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
