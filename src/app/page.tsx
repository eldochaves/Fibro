import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Usuário logado vai direto para sua área
  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");
    redirect(isAdmin ? "/admin" : "/historico");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-3xl">
          🩺
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
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
