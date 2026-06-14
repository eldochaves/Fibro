import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getContext, isProfileComplete } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const { user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const diaryEnabled = profile?.pain_diary_enabled === true;

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="animate-fade-up">
          <p className="text-sm text-navy-400">Olá{firstName ? `, ${firstName}` : ""} 👋</p>
          <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
            O que você gostaria de fazer?
          </h1>
          <p className="mt-1 text-navy-500">
            Escolha uma das opções abaixo para começar.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Questionário pré-consulta */}
          <ActionCard
            href="/questionario"
            icon="📝"
            title="Questionário pré-consulta"
            desc="Avaliação de fibromialgia (ACR 2016). Leva poucos minutos."
            cta="Preencher questionário"
          />

          {/* Diário de Dor */}
          {diaryEnabled ? (
            <ActionCard
              href="/diario"
              icon="📒"
              title="Diário de Dor"
              desc="Registre seus episódios de dor para acompanhamento."
              cta="Abrir diário"
            />
          ) : (
            <div className="card flex flex-col opacity-80">
              <div className="text-3xl">🔒</div>
              <h2 className="mt-3 font-display text-lg font-semibold text-navy-800">
                Diário de Dor
              </h2>
              <p className="mt-1 flex-1 text-sm text-navy-500">
                Fica disponível quando o seu médico habilitar para você.
              </p>
              <span className="mt-4 text-sm font-medium text-navy-300">
                Indisponível no momento
              </span>
            </div>
          )}
        </div>

        {/* Atalhos secundários */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/historico"
            className="card-flat flex items-center justify-between hover:border-teal-300"
          >
            <span className="text-sm font-medium text-navy-700">
              📊 Meu histórico
            </span>
            <span className="text-teal-600">→</span>
          </Link>
          <Link
            href="/perfil"
            className="card-flat flex items-center justify-between hover:border-teal-300"
          >
            <span className="text-sm font-medium text-navy-700">
              ⚙️ Meus dados
            </span>
            <span className="text-teal-600">→</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

function ActionCard({
  href,
  icon,
  title,
  desc,
  cta,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-card"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-2xl">
        {icon}
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-navy-800">
        {title}
      </h2>
      <p className="mt-1 flex-1 text-sm text-navy-500">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
        {cta}
        <span className="transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
