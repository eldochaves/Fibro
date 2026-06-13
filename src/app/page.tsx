import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CLINIC_NAME } from "@/lib/config";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Usuário logado vai direto para sua área
  if (user) {
    const [{ data: isAdmin }, { data: profile }] = await Promise.all([
      supabase.rpc("is_admin"),
      supabase
        .from("profiles")
        .select("full_name, birth_date")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    if (isAdmin) redirect("/admin");
    const complete = Boolean(profile?.full_name && profile?.birth_date);
    redirect(complete ? "/historico" : "/perfil");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt={CLINIC_NAME}
          width={280}
          height={78}
          priority
          className="mx-auto mb-6 h-auto w-64 max-w-full"
        />
        <h1 className="text-xl font-bold text-slate-900">
          Avaliação de Fibromialgia
        </h1>
        <p className="mt-2 text-slate-600">
          Responda ao questionário (critérios ACR 2016) enquanto aguarda a
          consulta. Leva poucos minutos e ajuda no seu acompanhamento.
        </p>
      </div>

      <div className="card space-y-4">
        <Link href="/login" className="btn-primary w-full">
          Entrar / Criar conta
        </Link>
        <p className="text-center text-sm text-slate-500">
          Você pode entrar com sua conta Google ou criar um cadastro com email
          e senha.
        </p>
      </div>

      <p className="text-center text-xs text-slate-400">
        Este questionário é uma ferramenta de apoio e não substitui a avaliação
        médica.
      </p>
    </main>
  );
}
