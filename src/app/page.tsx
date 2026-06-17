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
        .select("full_name, cpf, birth_date")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    if (isAdmin) redirect("/admin");
    const complete = Boolean(
      profile?.full_name && profile?.cpf && profile?.birth_date
    );
    redirect(complete ? "/inicio" : "/perfil");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10">
      <div className="w-full max-w-md animate-fade-up">
        {/* Marca */}
        <div className="mb-7 text-center">
          <Image
            src="/logo.png"
            alt={CLINIC_NAME}
            width={460}
            height={128}
            priority
            className="mx-auto h-auto w-full max-w-[360px] sm:max-w-[420px]"
          />
        </div>

        {/* Cartão principal */}
        <div className="card shadow-card sm:p-8">
          <span className="chip-teal mb-4">💙 Bem-vindo(a)</span>
          <h1 className="font-display text-3xl font-semibold leading-tight text-navy-800">
            Que bom ter você aqui
          </h1>
          <p className="mt-3 text-navy-500">
            Este é o seu espaço de acompanhamento com o{" "}
            <strong>Dr. Eldo Chaves</strong>. Aqui você responde questionários e
            registra como está se sentindo, no seu tempo e pelo celular — assim
            cuidamos de você mais de perto entre as consultas e deixamos o seu
            tratamento ainda mais personalizado.
          </p>

          <Link href="/login" className="btn-primary mt-6 w-full">
            Entrar / Criar conta
          </Link>
          <p className="mt-3 text-center text-sm text-navy-400">
            É rápido e gratuito. Entre com o Google ou com email e senha.
          </p>
        </div>

        {/* Selos de confiança */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Trust icon="🤝" title="Mais perto" desc="Do seu médico" />
          <Trust icon="🔒" title="Seguro" desc="Dados protegidos" />
          <Trust icon="💙" title="Gratuito" desc="Sem custo" />
        </div>

        <p className="mt-8 text-center text-xs text-navy-300">
          Ferramenta de apoio ao tratamento. Não substitui a consulta médica.
        </p>
      </div>
    </main>
  );
}

function Trust({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white/70 p-3 text-center backdrop-blur">
      <div className="text-xl">{icon}</div>
      <div className="mt-1 text-sm font-semibold text-navy-700">{title}</div>
      <div className="text-xs text-navy-400">{desc}</div>
    </div>
  );
}
