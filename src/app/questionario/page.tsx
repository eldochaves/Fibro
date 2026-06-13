import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";
import { QuestionarioForm } from "./QuestionarioForm";

export const dynamic = "force-dynamic";

export default async function QuestionarioPage() {
  const { user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  return (
    <>
      <Header email={user.email} />
      <main>
        <QuestionarioForm />
      </main>
    </>
  );
}
