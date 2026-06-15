import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";
import { normalizeFrequency, isAvailableNow } from "@/lib/availability";
import { QuestionarioForm } from "./QuestionarioForm";

export const dynamic = "force-dynamic";

export default async function QuestionarioPage() {
  const { supabase, user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");
  // Só acessa se o médico liberou o questionário ACR 2016
  if (!(profile?.questionnaires ?? []).includes("acr2016")) redirect("/inicio");

  // Respeita a frequência definida pelo médico
  const { data: lastAcr } = await supabase
    .from("assessments")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const acrFreq = normalizeFrequency(profile?.questionnaire_freq?.["acr2016"]);
  if (!isAvailableNow(acrFreq, lastAcr?.created_at ?? null)) redirect("/inicio");

  return (
    <>
      <Header email={user.email} />
      <main>
        <QuestionarioForm />
      </main>
    </>
  );
}
