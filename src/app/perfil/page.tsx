import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { getContext, isProfileComplete } from "@/lib/session";
import { PerfilForm } from "./PerfilForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const { user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");

  const firstTime = !isProfileComplete(profile);

  // Importa o nome da conta Google, caso o perfil ainda não tenha
  const meta = user.user_metadata ?? {};
  const defaultName =
    (meta.full_name as string) || (meta.name as string) || "";

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-xl font-bold">
          {firstTime ? "Bem-vindo(a)!" : "Meus dados"}
        </h1>
        <p className="mb-5 mt-1 text-sm text-slate-600">
          {firstTime
            ? "Antes de começar, confirme alguns dados para o seu médico identificar a sua avaliação."
            : "Atualize seus dados de cadastro."}
        </p>
        <PerfilForm
          profile={profile}
          defaultName={defaultName}
          firstTime={firstTime}
        />
      </main>
    </>
  );
}
