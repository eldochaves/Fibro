import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";
import { QuestionarioForm } from "./QuestionarioForm";

export const dynamic = "force-dynamic";

export default async function QuestionarioPage() {
  const { user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");
  // Só acessa se o médico liberou o questionário ACR 2016
  if (!(profile?.questionnaires ?? []).includes("acr2016")) redirect("/inicio");

  return (
    <>
      <Header email={user.email} />
      <main>
        <QuestionarioForm />
      </main>
    </>
  );
}
