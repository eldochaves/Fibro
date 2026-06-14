import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";
import { PainEpisodeList, type PainEpisode } from "@/components/PainEpisodeList";
import { DiarioForm } from "./DiarioForm";

export const dynamic = "force-dynamic";

export default async function DiarioPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const enabled = profile?.pain_diary_enabled === true;

  const { data: episodes } = enabled
    ? await supabase
        .from("pain_episodes")
        .select(
          "id, episode_date, start_time, activity, location, eva, radiation, end_time"
        )
        .order("episode_date", { ascending: false })
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link
          href="/inicio"
          className="mb-4 inline-block text-sm font-medium text-teal-600"
        >
          ← Voltar
        </Link>

        <h1 className="mb-1 font-display text-2xl font-semibold text-navy-800">
          Diário de Dor
        </h1>

        {!enabled ? (
          <div className="card mt-4 text-center text-navy-500">
            <div className="mb-2 text-3xl">🔒</div>
            <p>
              O Diário de Dor ainda não foi habilitado para você. Quando o seu
              médico habilitar, você receberá um aviso e poderá registrar seus
              episódios de dor aqui.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-navy-500">
              Registre cada episódio de dor, de preferência logo após acontecer.
              Anote até as dores leves. Traga este diário no seu retorno.
            </p>

            <div className="mb-6">
              <DiarioForm />
            </div>

            <h2 className="mb-3 text-sm font-semibold text-navy-700">
              Episódios registrados ({(episodes ?? []).length})
            </h2>
            <PainEpisodeList
              episodes={(episodes ?? []) as PainEpisode[]}
              patientView
            />
          </>
        )}
      </main>
    </>
  );
}
