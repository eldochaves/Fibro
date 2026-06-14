import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { getContext, isProfileComplete } from "@/lib/session";
import { QUESTIONNAIRES } from "@/lib/questionnaires";

export const dynamic = "force-dynamic";

export default async function InicioPage() {
  const { user, isAdmin, profile } = await getContext();
  if (isAdmin) redirect("/admin");
  if (!isProfileComplete(profile)) redirect("/perfil");

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const diaryEnabled = profile?.pain_diary_enabled === true;
  const assignedKeys = profile?.questionnaires ?? [];
  const assigned = QUESTIONNAIRES.filter((q) => assignedKeys.includes(q.key));
  const hasSomething = assigned.length > 0 || diaryEnabled;

  return (
    <>
      <Header email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex animate-fade-up items-center gap-4">
          <Avatar url={profile?.avatar_url} name={profile?.full_name} size={56} />
          <div>
            <p className="text-sm text-navy-400">
              Olá{firstName ? `, ${firstName}` : ""} 👋
            </p>
            <h1 className="font-display text-2xl font-semibold text-navy-800 sm:text-3xl">
              O que você gostaria de fazer?
            </h1>
          </div>
        </div>
        <p className="mt-2 text-navy-500">
          {hasSomething
            ? "Escolha uma das opções abaixo para começar."
            : "Assim que o seu médico liberar um questionário, ele aparecerá aqui."}
        </p>

        {!hasSomething ? (
          <div className="card mt-6 text-center">
            <div className="text-3xl">⏳</div>
            <p className="mt-2 text-navy-500">
              Nenhum questionário liberado ainda. Aguarde o seu médico — você
              será avisado quando algo estiver disponível.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {assigned.map((q) => (
              <ActionCard
                key={q.key}
                href={q.path}
                icon={q.icon}
                title={q.name}
                desc={q.description}
                cta="Preencher"
              />
            ))}

            {diaryEnabled && (
              <ActionCard
                href="/diario"
                icon="📒"
                title="Diário de Dor"
                desc="Registre seus episódios de dor para acompanhamento."
                cta="Abrir diário"
              />
            )}
          </div>
        )}

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
